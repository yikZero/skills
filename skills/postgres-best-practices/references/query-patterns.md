# Query Patterns

How to write and debug queries. Index selection mechanics live in `indexing.md`; this file is about query shape — most "database is slow" reports are one of the anti-patterns below.

## Measure first: the EXPLAIN workflow

1. Find candidates with `pg_stat_statements` (top by `total_exec_time` and by `mean_exec_time` — queries in `operations.md`) or `auto_explain` output.
2. `EXPLAIN (ANALYZE, BUFFERS)` the query with production-like data — plans flip as tables grow, so a 100-row dev database proves nothing.
3. Read the plan for these signals, in order:
   - **Estimated vs actual rows off by orders of magnitude** — the root cause behind most bad plans. Fix stale statistics (`ANALYZE`, raise the column's statistics target) or correlated columns (`CREATE STATISTICS ... (dependencies)` on column pairs the planner assumes independent).
   - **Seq Scan on a large table under a selective WHERE** — missing or unusable index (see `indexing.md` for why the planner ignores indexes).
   - **Sort Method: external merge Disk** — the sort spilled; raise `work_mem` for that session or add an index matching the `ORDER BY`.
   - **Nested Loop with a large outer side** — usually the misestimate above; the planner expected 3 rows and looped 300,000 times.
   - **High `Buffers: read` vs `hit`** — the query is I/O-bound; look at working-set size before micro-tuning.
4. After fixing, re-EXPLAIN and compare buffers touched, not just wall time — time varies with cache warmth, buffers don't.

## Anti-pattern catalog

**`SELECT *`** → name the columns. It drags TOASTed wide columns over the wire (the hidden 5ms→850ms cliff, `schema-design.md`), defeats index-only scans, and breaks when columns are added.

**OFFSET pagination** → keyset pagination. `OFFSET 100000` reads and throws away 100k rows on every page; latency grows linearly with page number.

```sql
-- keyset: constant-time any page; needs the matching index
SELECT * FROM products
WHERE (created_at, id) < ($last_created_at, $last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
CREATE INDEX products_created_at_id_idx ON products (created_at DESC, id DESC);
```

**N+1 query loops** → one query. A loop issuing `SELECT ... WHERE id = ?` per item spends its life in round-trips: `WHERE id = ANY($1)` with an array, or a join. ORMs generate N+1 silently — log and read the SQL they emit (OpenAI reviews all ORM-generated SQL; their worst incident query was ORM-built).

**Function or cast on the filtered column** → move computation to the right-hand side, or index the expression. `WHERE lower(email) = $1`, `WHERE created_at::date = '2026-07-01'`, and `WHERE int_col = '42'::text`-style implicit casts all make B-tree indexes unusable.

```sql
-- Bad: function on the column, index unusable
WHERE date_trunc('day', created_at) = '2026-07-01'
-- Good: range predicate, index usable
WHERE created_at >= '2026-07-01' AND created_at < '2026-07-02'
```

**`NOT IN (subquery)`** → `NOT EXISTS`. One NULL in the subquery silently returns zero rows, and the planner can't anti-join it (NULL logic in `schema-design.md`). `IN (subquery)` is fine; so is `EXISTS` — pick by readability, the planner treats them the same on PG12+.

**`DISTINCT` as a band-aid** → fix the join. If you added `DISTINCT` to remove duplicates a join fanned out, the query reads N× the rows it returns. Filter with `EXISTS` instead of joining one-to-many just to test presence.

**Correlated subquery per output row** → window function or `LATERAL`. `(SELECT count(*) FROM orders o WHERE o.user_id = u.id)` in the SELECT list re-executes per row; a grouped join or window computes it once.

**`OR` across different columns** → check the plan; the planner can BitmapOr two indexes, but when it can't, rewrite as `UNION` of two indexed queries.

**Giant `IN (literal, literal, ...)` lists** → `= ANY($1::bigint[])` (one parameter, one plan) or join against `VALUES` / a temp table for thousands of items.

**`ORDER BY x LIMIT n` without a matching index** → sorts the whole result to return n rows. The index must match column order and direction (`indexing.md`). Beware `LIMIT 1` with a filter on a different column: the planner may walk the ORDER BY index expecting an early match and scan millions of rows when the filter is rare.

**Exact `count(*)` for UI badges** → estimates. Exact count scans; for "about how many," `SELECT reltuples::bigint FROM pg_class WHERE relname = 'orders'` is free (kept fresh by autovacuum/ANALYZE).

**Many-way joins in the OLTP path** → decompose. Planning cost grows combinatorially (`join_collapse_limit` defaults to 8) and estimate errors multiply per join; OpenAI's worst repeated incident was a 12-table ORM join, and their fix was breaking it up and assembling in the application (`scaling.md`).

**CTEs as optimization fences, accidentally**: since PG12 `WITH` subqueries inline (good — predicates push down). Write `WITH x AS MATERIALIZED (...)` only when you deliberately want the fence (e.g. force one evaluation of an expensive subquery); on PG11 and older every CTE materializes, so avoid wrapping selective filters in CTEs there.

## Writes

- Batch inserts: multi-row `INSERT ... VALUES (...), (...), ...` or `COPY` for bulk (10–100× faster than row-at-a-time). Wrap related writes in one transaction — but keep transactions short and never open across network calls (`operations.md` timeouts).
- Upsert with `INSERT ... ON CONFLICT (unique_cols) DO UPDATE SET ...` — atomic, race-free, needs the unique index as its target. Check-then-insert in application code is a race condition.
- `RETURNING` avoids a follow-up SELECT after INSERT/UPDATE/DELETE.
- `UPDATE` only changed columns; updating a column to its current value still writes a new row version (MVCC) and churns indexes. Skip no-op writes in the app or with `WHERE col IS DISTINCT FROM $1` — redundant-write hunting was one of OpenAI's main primary-load reducers.
- Big DELETEs: batch like backfills (`migrations.md`); for whole-table clears use `TRUNCATE`; for recurring retention, partition and drop (`scaling.md`).

## Locking patterns

- Job queues: `FOR UPDATE SKIP LOCKED` — workers claim rows without serializing on each other:

```sql
WITH job AS (
  SELECT id FROM jobs WHERE status = 'pending'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
UPDATE jobs SET status = 'running', started_at = now()
FROM job WHERE jobs.id = job.id
RETURNING jobs.*;
```

- `SELECT ... FOR UPDATE` before read-modify-write prevents lost updates; `NOWAIT` to fail instead of queue.
- Lock rows in a consistent order (e.g. `ORDER BY id`) in multi-row transactions to dodge deadlocks; on deadlock (40P01) retry the whole transaction.
- Cross-process mutexes without a row to lock: transaction-scoped advisory locks (`pg_advisory_xact_lock(key)`), which also survive transaction pooling (`scaling.md`).

## JSONB queries

- Containment `@>` is the idiomatic filter and what GIN indexes serve: `WHERE data @> '{"type": "login"}'`.
- Equality/range on one key wants a B-tree expression index, not GIN: `CREATE INDEX ... ON events ((data->>'user_id'))`. GIN does not accelerate `->> =`.
- Never `data::text LIKE '%admin%'` — full scan plus false positives.
- A JSONB field that keeps showing up in WHERE clauses has earned promotion to a real column (`schema-design.md`).

## Full-text and fuzzy search

- Full-text: a stored generated `tsvector` column + GIN, queried with `@@` and ranked with `ts_rank` (setup in `schema-design.md` generated columns). Don't rebuild `to_tsvector(...)` per row per query.
- Fuzzy/substring (`LIKE '%term%'`, similarity): `pg_trgm` extension + GIN trigram index. Plain B-trees can't serve leading-wildcard LIKE.
