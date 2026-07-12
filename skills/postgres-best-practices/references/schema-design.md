# Schema Design and Data Types

Rules for creating and reviewing tables. Distilled from the PostgreSQL wiki ("Don't Do This"), CYBERTEC, Crunchy Data, pganalyze, and Supabase guidance. Each rule carries its why — schema mistakes are the most expensive kind because fixing them later is a migration (see `migrations.md` for the how).

## Naming and identifiers

- Lowercase `snake_case` for every identifier. Postgres folds unquoted names to lowercase, so `CamelCase` condemns you to double-quoting forever; alias at query time if output needs pretty names.
- Avoid reserved words as names — `user`, `order`, `group`, `select`, `end`. They force quoting and produce baffling errors (`user` is a built-in function). Use `users`, `orders`.
- Pick singular or plural table names and never mix. Predictable affixes: PK `id`, FK `<table_singular>_id`, timestamps `*_at`, booleans `is_*`/`has_*` — joins become guessable.
- Keep names under 63 bytes; Postgres silently truncates longer ones, and two long names truncated to the same prefix collide.
- Database encoding is UTF-8, never `SQL_ASCII` ("no conversion" = unrecoverable mixed encodings).

## Primary keys

- `bigint GENERATED ALWAYS AS IDENTITY`, not `serial`/`bigserial` (PG10+). Identity is SQL-standard, owned by the table, and `ALWAYS` blocks accidental manual inserts that desync the sequence (`OVERRIDING SYSTEM VALUE` for deliberate ones).
- `bigint`, never `int`, for surrogate keys: `int` dies at ~2.1 billion, and the emergency migration touches the table plus every referencing FK (see `migrations.md`). The 4 extra bytes usually vanish into alignment padding.
- UUID keys: native `uuid` type (16 bytes), never `text` (37+). Prefer time-ordered **UUIDv7** over random v4 for PKs — random v4 inserts at random B-tree positions, causing page splits, ~69%-full fragmented indexes, and extra WAL; v7 inserts append-mostly (~25–30% smaller PK index, materially faster inserts). PG18 has native `uuidv7()`; on 13–17 generate v7 in the application (`gen_random_uuid()` is v4).
- UUIDv7 leaks creation time. Fine for internal PKs; use random v4 for security tokens, reset links, share URLs.
- Decision rule: single-writer internal keys → `bigint` identity. Client-generated/distributed keys, or keys exposed in URLs where enumeration matters → `uuid` v7. Hybrid (internal bigint + external uuid) is legitimate.
- Every table gets a PK — without one, dedup is impossible and logical replication breaks. Natural keys only for genuinely immutable codes (ISO country/currency); emails and usernames change more often than promised.

## Data types

| Need | Use | Never | Why |
| --- | --- | --- | --- |
| Text | `text` (+ `CHECK (length(x) <= n)` if a real rule exists) | `varchar(255)` habit, `char(n)` | `text`/`varchar(n)` perform identically; `(n)` is just an insert-time error from a guessed limit. `char(n)` space-pads, corrupting comparisons |
| Money / exact quantities | `numeric` + `currency text` column (or `bigint` minor units) | `float`/`double`, `money` | Binary floats can't represent 0.1; errors compound across rows. `money` depends on session locale and has no currency |
| Point in time | `timestamptz` | `timestamp`, `timetz`, `timestamp(0)` | Bare `timestamp` has no zone — cross-zone arithmetic silently wrong. `(0)` *rounds*, putting values up to 0.5s in the future |
| Calendar date / duration | `date` / `interval` | timestamps posing as dates | Right-typed arithmetic; avoids off-by-one-timezone |
| Flags | `boolean NOT NULL DEFAULT false` | nullable boolean | A nullable flag is a three-state boolean every reader must interpret |
| Approximate measurements | `real`/`double precision` | — | Their legitimate niche: fast math where exactness doesn't matter |
| Case-insensitive unique text | unique index on `lower(email)` or `citext` | plain unique | `Bob@x.com` vs `bob@x.com` |

Time gotchas worth their own lines:

- `timestamptz` stores the instant, not the original zone. For future wall-clock events (calendar entries that follow DST), store `timestamptz` + IANA zone name column.
- `now()` is frozen at transaction start (all rows in one transaction share it); `clock_timestamp()` advances. `updated_at` needs a `BEFORE UPDATE` trigger — a `DEFAULT` only fires on INSERT.
- Half-open ranges for time windows: `WHERE ts >= $1 AND ts < $2`. `BETWEEN` is closed on both ends and double-counts boundary rows.
- Validity periods: range types + exclusion constraint beat `start`/`end` column pairs — `EXCLUDE USING gist (room_id WITH =, during WITH &&)` is the only race-free no-overlap enforcement. (PG18 adds native temporal PKs: `WITHOUT OVERLAPS`.)

## NULL semantics

NULL means unknown, and three-valued logic produces quiet wrong answers:

- `WHERE col <> 'archived'` drops rows where `col IS NULL`. Use `IS DISTINCT FROM`.
- `NOT IN (subquery)` returns zero rows if the subquery yields a single NULL, and the planner can't anti-join it. Always `NOT EXISTS`.
- A `CHECK` that evaluates to NULL passes — `CHECK (price > 0)` accepts NULL price. Pair with `NOT NULL`.
- Unique constraints allow many NULLs; "at most one NULL" needs `UNIQUE NULLS NOT DISTINCT` (PG15+) or a partial unique index.
- A NULL FK column skips the reference check entirely; mark FK columns `NOT NULL` unless the relationship is truly optional.
- `count(col)` skips NULLs vs `count(*)`; `sum()` of zero rows is NULL — `coalesce(sum(x), 0)`.
- Default sort treats NULL as largest — "top N by score DESC" shows NULLs first; say `NULLS LAST`.
- Therefore: `NOT NULL` on every column unless NULL is a meaningful business state. It's the cheapest constraint, and retrofitting it needs a table scan (safe pattern in `migrations.md`).

## Enumerated values: CHECK vs enum vs lookup table

All three beat unconstrained `text` (typos like `'shiped'` become permanent data). Decision tree:

- **Default: `text` + `CHECK (status IN (...))`.** Evolving the set is a constraint swap (`DROP CONSTRAINT` + `ADD ... NOT VALID` + `VALIDATE`), no rewrite, no type surgery.
- **Native enum** when the set is genuinely closed and stable (weekdays): 4 bytes, inherent order — but values can never be removed or reordered without rewriting every using column.
- **Lookup table + FK** when values are data: admin-editable at runtime, carry attributes (labels, translations, `is_active`), or need auditing.

## JSONB

- Default to typed, normalized columns; JSONB is the deliberate exception for genuinely variable attributes, third-party payloads kept for audit, and user-defined fields. Core-model-in-JSONB buys a worse document store: no types, no FK/CHECK, no per-field statistics.
- The winning pattern is hybrid — hot/filtered/constrained fields as real columns, the variable remainder in one `jsonb` column. **Promote a JSONB field to a real column the moment it's queried, indexed, or reported on.**
- Always `jsonb`, never `json` (raw text reparsed on every access; only preserves key order, which you don't need).
- JSONB values are immutable on disk: updating one key in a 1MB document rewrites ~1MB plus WAL plus TOAST churn. High-frequency single-field updates inside big documents = make those fields columns.
- Keep documents small (ideally under ~2KB — the TOAST threshold). Constrain shape when it matters: `CHECK (jsonb_typeof(attributes) = 'object')`.
- Index to match the operator (details in `indexing.md`): GIN for containment `@>`, B-tree expression index for equality/range on one key — GIN does not serve `->> =`.

## Arrays

- Arrays are for value-lists that are one attribute (tags, phone numbers) — never for relationships: Postgres cannot enforce FKs over array elements, so orphaned ids accumulate silently. Relationships get a junction table with a composite PK.
- Query with `@>`/`&&`/`= ANY(...)` and index with GIN, or containment checks are seq scans.
- If elements need their own attributes or individual updates, it was really a child table (updating one element rewrites the whole array).

## Constraints

Declare them in the database even when the app validates — the database is the only chokepoint every writer passes through (apps, ETL, psql, migrations). Priority order: constraints > triggers > app logic.

- Foreign keys on every relationship, and **index the referencing (child) column yourself** — Postgres doesn't. Unindexed FKs turn every parent DELETE (and cascade) into a child-table seq scan holding locks.
- Choose `ON DELETE` behavior explicitly. `CASCADE` on a big fan-out silently deletes millions of rows in one transaction; `RESTRICT` is the safe default until proven otherwise.
- `CHECK` every cheap single-row invariant: `quantity > 0`, `starts_at < ends_at`, state-machine rules like `CHECK (status <> 'shipped' OR tracking_id IS NOT NULL)`. Bugs get rejected at the door instead of discovered in reports.
- `UNIQUE` on every natural uniqueness rule (`(tenant_id, email)`, external ids, slugs). App-level check-then-insert is a race; the unique index is also the target `ON CONFLICT` needs.
- Adding any of these to a live table: `NOT VALID` → `VALIDATE` / `CONCURRENTLY` — mechanics in `migrations.md`.

## Defaults and generated columns

- Mandatory columns get sensible defaults (`DEFAULT now()`, `DEFAULT false`, `DEFAULT '{}'::jsonb`) — inserts stay lean and columns can be added without breaking writers. `ADD COLUMN ... DEFAULT <constant>` is instant since PG11.
- `GENERATED ALWAYS AS (expr) STORED` (PG12+) for derived values you filter or index on (e.g. a `tsvector` column) — computed at write, can't drift like app-maintained copies.
- PG18 trap: virtual generated columns became the **default kind** — omitting `STORED` now silently produces an unindexable virtual column. Write `STORED` explicitly.
- Don't use generated columns for frozen-in-time values (order total at purchase); they always recompute from current data — copy at insert instead.

## Normalization, wide tables, TOAST

- Start at 3NF; denormalize only for a measured, named access pattern, and prefer the cheap options first: views, materialized views (with an explicit refresh strategy), stored generated columns. Never EAV tables — JSONB is better on every axis.
- MVCC copies the whole row on every UPDATE. A hot counter next to a 500KB `jsonb` blob re-TOASTs the blob on every increment — split hot (small, frequently updated) and cold (large, rarely read) columns into separate tables sharing a PK.
- TOAST mechanics: rows over ~2KB get large values compressed/moved out-of-line; reads of TOASTed columns cost hidden extra I/O (not shown in `EXPLAIN ANALYZE` node timings). This is why `SELECT *` on wide tables hurts and why giant columns belong where routine queries won't touch them. PG14+: `SET COMPRESSION lz4` on big text/jsonb columns for much faster writes.
- A table approaching dozens of columns is a smell; 1600 is the hard limit but the model went wrong far earlier. Unbounded-growth tables with a natural key (time, tenant) should plan partitioning from day one (`scaling.md`) — partition keys must be in the PK, which is much easier before data arrives.

## Schemas, search_path, and RLS

- Group objects in purpose-named schemas rather than piling into `public`. Pre-PG15 databases: `REVOKE CREATE ON SCHEMA public FROM PUBLIC;` (the CVE-2018-1058 trojan-object attack: anyone who can create in your search_path can shadow your functions).
- Pin `search_path` in every `SECURITY DEFINER` function (`SET search_path = app, pg_temp`) — a definer function inherits the *caller's* path, which is privilege escalation waiting to happen. Set app search_path at the role level (`ALTER ROLE app_rw SET search_path = app`), not per-connection.
- Row-level security for tenant isolation that survives buggy app queries: policies need both `USING` (visible rows) and `WITH CHECK` (writable rows); owners bypass RLS unless `FORCE ROW LEVEL SECURITY`; index every column policies reference and wrap stable functions in scalar subselects (`(SELECT auth.uid()) = user_id`) so they evaluate once, not per row. Keep the tenant filter in app WHERE clauses too — defense in depth that also plans better.
- `tenant_id` on every tenant-owned table: `NOT NULL`, FK, indexed, leading column of composite indexes. Retrofitting tenancy is brutal.

## Version gates for generated DDL

Safe on PG13+ everywhere: identity columns, stored generated columns, `gen_random_uuid()`. Gate behind version checks: `UNIQUE NULLS NOT DISTINCT` and `MERGE` (15+), `uuidv7()`, virtual generated columns, `WITHOUT OVERLAPS`, NOT NULL as `NOT VALID` (18).
