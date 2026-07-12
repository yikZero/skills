# Scaling Postgres

How to keep one PostgreSQL cluster healthy as QPS grows, based heavily on OpenAI's published playbook (single Azure Postgres primary + ~50 read replicas serving millions of QPS for 800M ChatGPT users at low double-digit-ms p99) plus standard practice. The architecture-level rules live here; server tuning and migration mechanics live in `operations.md` and `migrations.md`.

## The failure mode to design against

Postgres outages under load usually follow one cycle: an upstream trigger (cache-layer failure causing a miss storm, a surge of expensive queries, a write spike from a feature launch) overloads the database → queries slow down and time out → clients retry → retries multiply the load. Every scaling decision below exists to break a link in that loop. Concretely:

- Set timeouts at every layer (statement, connection acquisition, request) so slow turns into failed-fast, not queued.
- Retry with exponential backoff and jitter, and cap retries. Aggressive retry intervals turn a blip into a retry storm.
- Rate-limit above the database (application, pooler, per-query) so a single endpoint or query shape cannot saturate shared capacity.
- Make cache misses coalesce (below), because the cache layer failing is a database load event.

## Reads scale out; writes do not

A single primary with replicas scales read-heavy workloads much further than most teams assume — that is OpenAI's core lesson. Writes are the scarce resource, for an MVCC-specific reason: updating even one field copies the entire row as a new version. Heavy writes mean write amplification, dead tuples for readers to skip, table/index bloat, and harder autovacuum tuning. So the strategy is asymmetric:

**Protect the primary's write capacity:**

- Offload every read that can tolerate a replica to a replica. Reads that must run on the primary (inside write transactions) must be fast — audit them.
- Hunt redundant writes: application bugs that write unchanged values, audit rows nobody reads, counters updated per-request that could be batched. Use lazy/deferred writes to smooth spikes.
- Throttle backfills hard. A backfill is a self-inflicted write storm; strict rate limits that stretch it over days beat production impact (OpenAI lets backfills run over a week).
- Freeze growth on a hot primary: no new tables, no new write-heavy workloads. New workloads go to a separate database or a horizontally sharded store by default. Grandfathering everything into the one shared primary is how it becomes unmigratable.
- Move shardable write-heavy workloads out entirely (OpenAI migrates them to sharded systems like Cosmos DB). Sharding the leftover workload later is months-to-years of work touching hundreds of endpoints — segregate early instead.

**Then scale reads mechanically:**

- Add replicas per region, co-located with the services that read them, with enough headroom that one replica failing does not overload the rest.
- Run the primary with a hot standby for fast failover. Design critical paths to be read-only where possible: if writes fail but reads serve, an outage downgrades from total to partial.
- WAL fan-out limits replica count: the primary ships WAL to every replica, so bandwidth/CPU pressure grows and lag destabilizes as replicas multiply. Cascading replication (intermediate replicas relaying WAL) lifts that ceiling at the cost of failover complexity.

## Connection pooling

Postgres spawns a process per connection; connections are expensive and capped (`max_connections`; 5,000 on Azure Flexible Server). Connection storms are a classic incident cause.

- Put PgBouncer (or equivalent: Odyssey, Supavisor, RDS Proxy) between applications and Postgres. Transaction pooling mode gives the big multiplexing win; OpenAI measured average connection time dropping 50ms → 5ms. Session mode preserves all features but shares almost nothing; statement mode is niche.
- Transaction mode breaks session state — consecutive statements may hit different server connections. Silently misbehaving: `SET` (use `SET LOCAL` inside a transaction), session-level advisory locks (use `pg_advisory_xact_lock`), `LISTEN/NOTIFY`, SQL-level `PREPARE`, `WITH HOLD` cursors, temp tables. Protocol-level prepared statements need PgBouncer 1.21+ with `max_prepared_statements > 0` — otherwise disable the driver's statement cache.
- Run migrations and logical-replication tooling on a direct connection, not through the pooler — they depend on session state and long transactions.
- Size server-side pools near the database's real concurrency — the classic formula is roughly `cores × 2 + spindles` active connections; a 16-core box saturates around 30–50 active queries. The pooler's job is to queue the rest; raising `max_connections` instead of pooling just adds thrash. Leave reserved slots above pool size for superuser/monitoring/migrations.
- Configure pooler idle timeouts and per-pool limits; idle-connection accumulation is quieter than a storm but ends the same way.
- Co-locate pooler pods with the clients and the replica they front (same region) — cross-region connection setup and chatty round-trips dominate otherwise. OpenAI runs multiple PgBouncer pods per replica behind one Kubernetes Service, since PgBouncer is single-threaded — scale it horizontally.

## Caching in front of Postgres

At high read QPS most traffic should hit a cache, which makes the database's real capacity smaller than dashboards suggest — a cache failure replays the full read load onto Postgres.

- Use single-flight (lock/lease) cache fills: on a miss, one request takes a short lock, queries Postgres, repopulates; concurrent missers wait for the cache instead of stampeding the database.
- Treat cache hit rate as a database health metric with alerting, and size Postgres headroom assuming a realistic miss storm.

## Read replicas and staleness

- Replication lag is the tax on read offloading. Monitor and alert per replica, and route around laggards:

```sql
-- on the primary
SELECT client_addr, state, write_lag, flush_lag, replay_lag,
       pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS replay_lag_bytes
FROM pg_stat_replication;
-- on a replica
SELECT now() - pg_last_xact_replay_timestamp() AS approx_lag;
```

- Lag spikes usually trace to write bursts on the primary (unthrottled backfills — see `migrations.md`), long replica queries conflicting with WAL replay (replay is single-threaded), or underpowered replica I/O.
- Handle read-your-writes explicitly: pin a session to the primary briefly after it writes, or capture `pg_current_wal_lsn()` after the write and read from a replica only once `pg_last_wal_replay_lsn()` has passed it. Do not pretend replicas are synchronous.
- The replica-conflict dilemma: WAL replay wants to remove rows a replica query still reads. Either replay waits then cancels the query (`max_standby_streaming_delay`, default 30s — raise it on analytics replicas) or `hot_standby_feedback = on` makes the primary's vacuum wait instead — at the cost of primary bloat while long replica queries run. Enable feedback for short-query read scaling; never feed a 6-hour BI query's xmin to an OLTP primary — give analytics a dedicated replica.
- Replication slots guarantee WAL retention for a disconnected replica — and an orphaned slot fills the primary's disk. Always cap with `max_slot_wal_keep_size` and monitor `pg_replication_slots`.

## Workload isolation and load shedding

- Split traffic into priority tiers on separate instances/replica pools: a low-priority batch job saturating CPU must not slow checkout. Same for per-product isolation — one product's launch should not brown out another.
- Build a kill switch for query shapes: rate-limit or block specific query digests (via the ORM layer, pooler, or proxy) so one bad query pattern can be shed in minutes during an incident instead of waiting for a deploy.
- Keep expensive analytics (12-way joins, unbounded scans) off the OLTP path entirely; break complex joins into simpler queries and assemble in the application when the alternative is a planner-hostile monster query (see `query-patterns.md`).

## Partitioning

Partitioning is for data lifecycle and vacuum manageability more than raw speed — partition pruning helps queries, but the decisive wins are dropping old data instantly and vacuuming smaller tables.

- Reach for declarative partitioning when a table is roughly 100GB+ or has time-based retention. `DROP PARTITION`/`DETACH PARTITION CONCURRENTLY` replaces a months-long `DELETE` + vacuum slog.
- The partition key must be part of every unique constraint (including the PK) — design keys before data arrives; retrofitting partitioning onto a live table is a full-table migration.
- Queries only prune when they filter on the partition key with planner-visible predicates. Verify with `EXPLAIN` that you see `Partitions: ...` pruning, not a scan of every child.
- Keep partition counts sane (hundreds, not tens of thousands — planning time and memory grow with count), and pre-create future partitions with automation (`pg_partman`); running out of future partitions is a classic outage.
- Beware the default partition: it catches strays, but every new partition attach must scan it under lock to prove no overlap, and stray rows block creating the proper partition. Time-series setups often skip it and rely on automation.
- Lock-safe maintenance: create the new table with a matching `CHECK` constraint before `ATTACH PARTITION` (skips the validation scan); retire data with `DETACH PARTITION CONCURRENTLY` (PG14+) then `DROP TABLE`. Index builds on partitioned tables need the parent-`ONLY`-then-attach trick (`migrations.md`).

## When single-writer Postgres is no longer enough

Exhaust these in order — each is cheaper than the next: query/index optimization → caching → read replicas → write reduction → workload isolation → moving write-heavy workloads to purpose-built stores → sharding Postgres itself (Citus/app-level). OpenAI at 800M users still has not needed the last step; if you think you need sharding, first verify writes (not reads, connections, or one bad query) are actually the bottleneck.
