# Operations: Config, Autovacuum, Timeouts, Monitoring

Production server care. Starting points, not gospel — tune from observed behavior. Pooling, replicas, and partitioning live in `scaling.md`; migration mechanics in `migrations.md`.

## Timeouts every database should set

Set these at the role/database level so they hold for every connection, not just well-behaved app configs:

```sql
ALTER ROLE app_user SET statement_timeout = '15s';                      -- web-tier: a slower query is a bug
ALTER ROLE app_user SET lock_timeout = '2s';                            -- never camp in a lock queue
ALTER ROLE app_user SET idle_in_transaction_session_timeout = '60s';    -- the top vacuum-blocker
```

- `statement_timeout`: short for app roles (5–30s web; GitLab runs 15s). Migration/analytics roles override per-session, deliberately.
- `idle_in_transaction_session_timeout`: an abandoned `BEGIN` holds locks and pins the xmin horizon — vacuum can't clean anything newer, bloat grows database-wide. OpenAI calls this setting essential.
- `transaction_timeout` (PG17+) bounds a whole transaction even if each statement is fast.
- Client side: `connect_timeout`, TCP keepalives, driver socket timeout slightly above `statement_timeout`.
- Retry only idempotent transactions, on serialization failure (40001), deadlock (40P01), and connection errors — whole transaction, capped exponential backoff with jitter. Aggressive retries are how one slow query becomes an outage (`scaling.md`).

## Configuration starting points

Memory (for a dedicated box; managed services preset most of this — don't fight them):

- `shared_buffers`: 25% of RAM (cap ~40%). Postgres double-buffers with the OS cache; more is not better. Restart required.
- `effective_cache_size`: 50–75% of RAM. Planner hint, not an allocation — tells it index scans will hit cache.
- `work_mem`: per sort/hash **node**, per query, per connection — 200 connections × 3 nodes × 64MB can OOM the box. Start 16–64MB with pooled connections; raise per-session for known heavy queries (`SET work_mem = '256MB'`). `log_temp_files = 0` reveals queries spilling to disk.
- `maintenance_work_mem`: 512MB–2GB — one per operation (VACUUM, CREATE INDEX, FK validation), so generosity pays off in index-build speed.

I/O and WAL:

- `random_page_cost = 1.1` on SSD/NVMe/cloud (default 4.0 assumes spinning rust and irrationally scares the planner away from index scans). `effective_io_concurrency = 200` on SSD.
- Checkpoints spread out: `max_wal_size` 4–16GB on busy systems (the 1GB default forces constant checkpoints), `checkpoint_timeout` 15–30min, `wal_compression = on`. Alert when logs show checkpoints triggered by WAL volume ("requested") rather than schedule — that's the config asking for more headroom.
- `huge_pages = try` once shared_buffers is multi-GB. `synchronous_commit = off` only for genuinely loss-tolerant data (never touch `fsync`).

Baseline with PGTune (pgtune.leopard.in.ua) or provider parameter groups, then adjust from monitoring.

## Autovacuum and bloat

MVCC leaves dead tuples on every UPDATE/DELETE; vacuum reclaims them. Left behind: bloated tables/indexes, slower scans — and eventually transaction-ID wraparound, where Postgres refuses writes entirely. Never disable autovacuum; make it more aggressive, not less.

- Default trigger (`scale_factor 0.2`) means a 1B-row table accumulates 200M dead rows before vacuum runs. Big tables need per-table settings:

```sql
ALTER TABLE events SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_analyze_scale_factor = 0.005
);
```

- Autovacuum is cost-throttled for 2005-era disks: raise `autovacuum_vacuum_cost_limit` (200 → 2000+) and `autovacuum_max_workers` (workers share the cost budget — more workers alone means each goes slower). Frequent cheap vacuums beat rare monster vacuums.
- What blocks vacuum from cleaning (the xmin horizon): long transactions, idle-in-transaction sessions, abandoned replication slots, orphaned prepared transactions, and `hot_standby_feedback` from replicas running long queries. Watch `SELECT max(age(backend_xmin)) FROM pg_stat_activity;` and `pg_replication_slots`.
- Wraparound headroom — alert well before 200M, panic before ~1B:

```sql
SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY 2 DESC;
```

- Fixing existing bloat: plain `VACUUM` frees space for reuse but doesn't shrink files; `VACUUM FULL` takes `ACCESS EXCLUSIVE` for the duration — use `pg_repack` online instead.
- Reduce bloat at the source: don't index frequently-updated columns (kills HOT updates — every update then touches every index); `fillfactor = 90` on update-heavy tables leaves room for HOT; keep transactions short.
- After bulk loads or big backfills: manual `VACUUM (ANALYZE)` — don't wait for the trigger.

## Monitoring: the health-check queries

`pg_stat_statements` is the single highest-value extension — enable it everywhere (`shared_preload_libraries`):

```sql
SELECT calls, round(mean_exec_time::numeric, 2) AS mean_ms,
       round(total_exec_time::numeric, 2) AS total_ms, rows,
       left(query, 80) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC LIMIT 15;   -- also sort by mean_exec_time and by calls
```

Live activity — connection states, long transactions, and who blocks whom:

```sql
SELECT state, count(*) FROM pg_stat_activity GROUP BY 1;          -- alert on idle-in-transaction pileups

SELECT pid, now() - xact_start AS xact_age, state, wait_event_type, wait_event, left(query, 60)
FROM pg_stat_activity
WHERE xact_start < now() - interval '5 minutes' ORDER BY xact_start;

SELECT pid, pg_blocking_pids(pid) AS blocked_by, wait_event_type, left(query, 60)
FROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

Cache hit ratio (want >0.99 for OLTP; a falling ratio means the working set outgrew RAM):

```sql
SELECT sum(blks_hit)::float / nullif(sum(blks_hit) + sum(blks_read), 0) FROM pg_stat_database;
```

Table/index health:

```sql
SELECT relname, n_dead_tup, last_autovacuum FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;
SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;               -- failed CONCURRENTLY builds
SELECT indexrelname, idx_scan FROM pg_stat_user_indexes WHERE idx_scan = 0;   -- unused-index candidates
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;
```

Logging that pays for itself: `log_min_duration_statement = 250ms` (or sampled), `log_lock_waits = on`, `log_temp_files = 0`, `log_autovacuum_min_duration = 250ms`, plus `auto_explain` with `auto_explain.log_min_duration = 1s` to capture real plans of slow production queries — the plan you can't reproduce in staging.

Alert on: connection count vs `max_connections`, replication lag (`scaling.md`), wraparound age, oldest transaction/xmin age, replication-slot retained WAL, disk %, checkpoint frequency, deadlock/serialization-failure spikes. Note `pg_stat_statements` gives averages only — p95/p99 need `pg_stat_monitor` or client-side measurement (OpenAI measures latency at the application layer for exactly this reason).

## Security and production checklist

- App roles are never superuser and never the schema owner; separate the migration role (DDL) from the runtime role (DML). Contains blast radius and blocks accidental DDL.
- `scram-sha-256` auth (default since PG14); never `trust` over TCP. TLS on, clients at `sslmode=verify-full` (plain `require` skips certificate verification). Restrict reachable CIDRs.
- Backups = automated base backups + WAL archiving (pgBackRest/WAL-G or provider PITR), with defined RPO/RTO. **A backup you haven't test-restored is a hope, not a backup** — schedule restore drills.
- Patch minor versions promptly; plan major upgrades via logical replication or tested `pg_upgrade --link` runbooks.
- Don't log secrets: `log_statement = 'ddl'` in prod, scrub bind params in APM.
- Human read-only access via a role with `default_transaction_read_only = on`; analytics against a replica, never the primary.
