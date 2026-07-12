---
name: postgres-best-practices
description: "Use when working with PostgreSQL: designing schemas or choosing data types, writing or reviewing SQL queries, adding indexes, debugging slow queries with EXPLAIN, writing migrations or DDL, running backfills, tuning autovacuum or connection pooling, or scaling reads/writes in production. Trigger on mentions of Postgres, psql, JSONB, EXPLAIN ANALYZE, pg_stat_statements, PgBouncer, vacuum, replication, partitioning, or slow database queries."
---

# Postgres Best Practices

Production-proven PostgreSQL rules, synthesized from OpenAI's scaling playbook, the PostgreSQL wiki, strong_migrations, and the Crunchy Data / pganalyze / CYBERTEC corpus. Two habits drive everything here:

1. **Measure before optimizing.** Read query plans with `EXPLAIN (ANALYZE, BUFFERS)` and find hot queries with `pg_stat_statements` before changing schema, queries, or config.
2. **Every schema change must be lock-safe.** Assume the table is large and serving traffic. DDL that takes `ACCESS EXCLUSIVE` for more than an instant is an outage, not a migration.

## Reference Map

| File | Owns | Read when |
| --- | --- | --- |
| `references/schema-design.md` | Data types, constraints, naming, table layout | Creating or reviewing tables, choosing types/keys |
| `references/query-patterns.md` | Query anti-patterns, EXPLAIN workflow, pagination, JSONB queries, locking | Writing or debugging SQL, slow-query hunts |
| `references/indexing.md` | Index type selection, composite ordering, partial/covering/expression indexes, maintenance | Adding indexes, unused/bloated index cleanup |
| `references/migrations.md` | Zero-downtime DDL, lock timeouts, safe patterns per operation, batched backfills | Writing any migration or backfill |
| `references/operations.md` | Config tuning, autovacuum, timeouts, monitoring queries | Production tuning, incident triage, health checks |
| `references/scaling.md` | Connection pooling, read replicas, partitioning, OpenAI single-primary playbook | High QPS, connection exhaustion, big-table strategy |

## Task Routing

- Designing a new table or reworking one → `schema-design.md`, then `indexing.md`.
- Query is slow or being reviewed → `query-patterns.md`; add `indexing.md` if the fix is an index.
- Writing a migration (any DDL on an existing table) → `migrations.md` first, always.
- Database feels slow overall, connections piling up, lag → `operations.md`, then `scaling.md`.
- Greenfield architecture or scale planning → `scaling.md`.

## Non-Negotiables

Apply these even without reading a reference. Each exists because violating it causes incidents or silent data problems, not style complaints.

1. `text` + `CHECK`, not `varchar(n)`; `timestamptz`, not `timestamp`; `numeric`, not `money` or floats for money; `bigint` (or UUIDv7), not `int`, for surrogate keys.
2. Every migration sets `lock_timeout` (a few seconds) so blocked DDL fails fast instead of queueing the whole workload behind it.
3. `CREATE INDEX CONCURRENTLY` on populated tables — plain `CREATE INDEX` blocks writes for the whole build.
4. Add `NOT NULL` / foreign keys to existing tables as `NOT VALID` first, then `VALIDATE CONSTRAINT` — validation without `NOT VALID` scans the table under an exclusive lock.
5. Backfills run in batches with pauses, never one `UPDATE` of the whole table — one giant transaction bloats the table, blocks vacuum, and stalls replicas.
6. No `SELECT *` in application code: it drags TOASTed wide columns over the wire and breaks covering-index-only scans.
7. Paginate with keyset (`WHERE (created_at, id) < (?, ?) ORDER BY ... LIMIT ?`), not `OFFSET` — `OFFSET n` reads and discards n rows every page.
8. Parameterized queries only. String-built SQL is an injection and a plan-cache miss.
9. Keep transactions short and never hold one open across network calls or user interaction; set `idle_in_transaction_session_timeout`. Long transactions block vacuum for the entire database.
10. Index every foreign-key column you join or cascade on — Postgres does not do this for you.
11. Match index column order to the query: equality columns first, then the range/sort column. A `(a, b)` index does not serve `WHERE b = ?`.
12. Applications connect through a pooler (PgBouncer or equivalent) in transaction mode; direct per-request connections exhaust `max_connections` under load.
13. Set `statement_timeout` for application roles so a runaway query degrades one request, not the database.
14. New high-write or unbounded-growth workloads do not get added to an already-hot primary — put them in a separate database, or plan partitioning/sharding up front.

## Review Output

When reviewing schema, queries, or migrations, lead with findings:

```text
findings:
- file:line — issue, why it bites in production, concrete fix (SQL included).
```

Order by blast radius: data loss/corruption risks, then outage risks (locks, missing timeout), then performance, then style. Say "no blocking issues" explicitly when true. Avoid speculative advice the code in front of you does not exhibit.

## Version Notes

Rules assume PostgreSQL 13+. Version-specific behavior (fast `ADD COLUMN ... DEFAULT` since 11, inlined CTEs since 12, `MERGE` since 15, native `uuidv7()` in 18) is flagged inline in the references. When the target version is unknown, check with `SELECT version();` before relying on version-gated advice.
