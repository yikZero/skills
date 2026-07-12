# Indexing

Choosing, shaping, and maintaining indexes. Query-shape fixes live in `query-patterns.md`; this file owns the index side of the conversation.

## The economics

Every index taxes every INSERT and many UPDATEs/DELETEs on the table forever — write amplification, WAL volume, vacuum work — and indexing a frequently-updated column disables HOT updates for the whole row (`operations.md`). So: index what queries demonstrably need (WHERE, JOIN, ORDER BY patterns from `pg_stat_statements`), and delete what they don't. An index earns its keep through selectivity: if a predicate matches 30% of the table, a seq scan is legitimately cheaper and the planner is right to ignore you.

Two must-index cases people skip: foreign-key (child) columns — Postgres does not index them automatically and unindexed FKs turn parent deletes into locked seq scans (`schema-design.md`) — and the exact column tuple your keyset pagination sorts by (`query-patterns.md`).

## Index type selection

| Type | Serves | Reach for it when |
| --- | --- | --- |
| B-tree (default) | `=`, `<`, `>`, `BETWEEN`, `IN`, `ORDER BY`, `IS NULL` | ~95% of cases |
| GIN | `@>`, `?`, `&&`, `@@`, trigram `LIKE`/similarity | JSONB containment, arrays, full-text, fuzzy search. Slower to update — `fastupdate` batches help |
| GiST | Overlap/distance: `&&`, `<->` | Ranges + exclusion constraints, geometry, nearest-neighbor |
| BRIN | Range predicates on physically-correlated columns | Huge append-only tables (logs, events) — kilobytes of index for terabytes of data, but only if insert order matches column order |
| Hash | `=` only | Almost never; B-tree matches it and does more |

JSONB fine print: plain GIN on the column supports all operators; `jsonb_path_ops` GIN is smaller and faster but serves only `@>`. Single-key equality wants a B-tree expression index instead (`query-patterns.md`).

## Composite indexes: column order is the design

The leftmost-prefix rule: an index on `(a, b, c)` serves predicates on `(a)`, `(a, b)`, `(a, b, c)` — not `(b)` or `(b, c)` alone. Order columns by how queries use them:

1. **Equality columns first** (in any order among themselves).
2. **Then the one range or sort column.** Everything after a range column is dead weight for seeking — the scan stops seeking and starts filtering there.

```sql
-- Query: WHERE tenant_id = $1 AND status = $2 AND created_at > $3 ORDER BY created_at DESC
CREATE INDEX orders_lookup_idx ON orders (tenant_id, status, created_at DESC);
-- (tenant_id, created_at, status) would seek on tenant_id+created_at, then row-filter status — worse.
```

- One composite index usually replaces several single-column ones; conversely `(a, b)` makes a separate `(a)` index redundant — drop it.
- `ORDER BY` is served only when direction matches (all-ASC index serves all-DESC by walking backward, but mixed `ORDER BY a ASC, b DESC` needs the index declared that way) and NULLS placement agrees.
- Don't order columns by "cardinality" folklore; order by the query shape above.

## Partial indexes

Index the rows queries actually touch:

```sql
CREATE INDEX jobs_pending_idx ON jobs (created_at) WHERE status = 'pending';
```

Smaller, hotter in cache, cheaper to maintain — ideal for skewed states (the 0.1% of jobs that are pending) and for "active rows" patterns (`WHERE deleted_at IS NULL`). The query's WHERE clause must imply the index predicate with literally matching conditions, so standardize the spelling of that predicate. A partial unique index enforces conditional uniqueness (`one active subscription per user`), something a plain constraint can't say.

## Covering indexes and index-only scans

`INCLUDE` carries extra columns in the leaf pages so the query never visits the heap:

```sql
CREATE INDEX orders_user_status_idx ON orders (user_id, status) INCLUDE (total, created_at);
```

Index-only scans also require the visibility map to be current — a write-heavy, under-vacuumed table quietly degrades them back to heap fetches (`Heap Fetches: N` in EXPLAIN; fix vacuum, `operations.md`). This optimization is also why `SELECT *` can never use it.

## Expression indexes

Index exactly the expression the query filters on: `lower(email)`, `(data->>'user_id')`, `date_trunc('day', created_at)`. The query must use the same expression verbatim, and the expression must be immutable. Doubles as case-insensitive uniqueness (`schema-design.md`).

## Why the planner ignores your index

Check these before forcing anything:

1. Function/cast wrapping the column, or a type mismatch between column and parameter (`query-patterns.md`).
2. Low selectivity — the predicate matches too much of the table; seq scan wins.
3. Stale or structurally-wrong statistics — actual vs estimated rows diverge in EXPLAIN; run `ANALYZE`, raise the statistics target, or add extended statistics.
4. Leading-wildcard `LIKE '%x%'` — needs trigram GIN, not B-tree.
5. Tiny table — everything fits in one page; seq scan is correct.
6. The index exists but is INVALID after a failed concurrent build (`migrations.md`).
7. On SSDs with default config, `random_page_cost = 4.0` overprices index scans (`operations.md`).

`SET enable_seqscan = off` in a session is a diagnostic (does the index work at all?), never a fix.

## Maintenance

- **Unused indexes**: `pg_stat_user_indexes WHERE idx_scan = 0` — but check every replica too (stats are per-instance; an index unused on the primary may serve replica reads) and remember stats reset on failover. Drop with `DROP INDEX CONCURRENTLY`. OpenAI asked the Postgres community for "disable index without dropping" precisely because this is nervous surgery — on PG12+ you can `UPDATE pg_index SET indisvalid = false` as a reversible test only if you accept catalog-hacking risk; otherwise just drop and be ready to rebuild.
- **Duplicate/overlapping indexes**: any index whose columns are a leftmost prefix of another's is usually redundant — find and drop.
- **Bloat**: `REINDEX CONCURRENTLY` (PG12+) rebuilds without blocking; UUID v4 PKs and churn-heavy tables bloat fastest (`schema-design.md` for the v7 fix).
- **Build hygiene**: always `CONCURRENTLY` on live tables, with INVALID-index cleanup on failure and the partitioned-table attach dance — all in `migrations.md`.
- After creating an index, verify the win in EXPLAIN and keep it only if a real query uses it; speculative indexes are pure write tax.
