# Safe Migrations (Zero-Downtime DDL)

Rules for changing schema on tables that are serving traffic. Assume every table is large and hot unless proven otherwise — the safe pattern costs little on small tables, but the unsafe pattern on a big table is an outage. Synthesized from strong_migrations, GitLab's migration style guide, postgres.ai, GoCardless, and OpenAI's schema-change policy.

## The mental model: the lock queue

Most `ALTER TABLE` forms take an `ACCESS EXCLUSIVE` lock — conflicting with everything, including `SELECT`. The trap is not holding the lock; it is **waiting** for it: a DDL statement queued behind one slow query blocks every query that arrives after it, reads included. One instant `ALTER TABLE` waiting behind a 10-minute analytics query means 10 minutes of full-table outage. This is why OpenAI enforces a 5-second timeout on all schema changes and treats any query running >1s as a blocker to fix before DDL can ship.

Lock severity cheat sheet:

- `ACCESS EXCLUSIVE` (blocks reads + writes): most `ALTER TABLE`, `DROP`, `TRUNCATE`, `VACUUM FULL`, non-concurrent `REINDEX`/`DETACH PARTITION`.
- `SHARE` (blocks writes): plain `CREATE INDEX` — never on a live table.
- `SHARE ROW EXCLUSIVE` (blocks writes, **on both tables**): `ADD FOREIGN KEY`, `CREATE TRIGGER`. A migration on a "quiet" table can take down the hot table it references.
- `SHARE UPDATE EXCLUSIVE` (reads + writes continue): `CREATE INDEX CONCURRENTLY`, `VALIDATE CONSTRAINT`, `VACUUM`, `ANALYZE`, `ATTACH PARTITION` (PG12+), `DETACH PARTITION CONCURRENTLY` (PG14+). These are the tools of online DDL.

## The preamble: every migration, no exceptions

```sql
BEGIN;
SET LOCAL lock_timeout = '5s';           -- fail fast instead of poisoning the lock queue
SET LOCAL statement_timeout = '15min';   -- bound total work (override the app's short timeout)
ALTER TABLE users ADD COLUMN plan text;  -- metadata-only, but still needs the lock
COMMIT;
```

On failure (`SQLSTATE 55P03`, lock_not_available), retry the whole transaction with backoff and jitter — GitLab retries up to 50 times over ~40 minutes. A failed lock acquisition is a non-event; a lock queue pile-up is an incident. Prefer whole-transaction retries over savepoints (subtransactions burn XIDs and stall standbys). Before a risky migration, check for long transactions that would block it:

```sql
SELECT pid, state, xact_start, left(query, 60) FROM pg_stat_activity
WHERE xact_start < now() - interval '5 minutes';
```

Keep each migration small (one concern, one FK per transaction, minutes not hours) and separate schema changes from data changes.

## Operation playbook

### Add a column

- Nullable, no default: metadata-only, safe.
- `DEFAULT <constant>`: safe on PG11+ (stored as metadata, no rewrite).
- `DEFAULT <volatile>` (`gen_random_uuid()`, `clock_timestamp()`): **rewrites the table on every version**. Instead: add the column → `ALTER COLUMN ... SET DEFAULT` (new rows only) → backfill in batches.
- Never add a column and backfill it in the same transaction — the DDL lock is held for the whole backfill.

### Add NOT NULL to an existing column

`ALTER COLUMN ... SET NOT NULL` scans the whole table under `ACCESS EXCLUSIVE`. Safe pattern:

```sql
ALTER TABLE users ADD CONSTRAINT users_email_nn CHECK (email IS NOT NULL) NOT VALID; -- instant
-- backfill NULLs in batches here
ALTER TABLE users VALIDATE CONSTRAINT users_email_nn;  -- full scan, but writes continue
ALTER TABLE users ALTER COLUMN email SET NOT NULL;     -- PG12+: proven by the check, no scan
ALTER TABLE users DROP CONSTRAINT users_email_nn;
```

Pre-PG12, keep the validated CHECK constraint and skip the real `SET NOT NULL`.

### Add a foreign key or CHECK constraint

Plain `ADD FOREIGN KEY` validates every row while write-locking both tables. Split it:

```sql
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users (id) NOT VALID;  -- brief lock, no scan; enforced for new rows
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_user;    -- scan with writes still flowing
```

Same `NOT VALID` → `VALIDATE` split for CHECK constraints.

### Add a unique constraint

```sql
CREATE UNIQUE INDEX CONCURRENTLY users_email_key ON users (email);
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE USING INDEX users_email_key;
```

### Create or drop an index

Always `CONCURRENTLY` on populated tables. Know its quirks:

- Cannot run inside a transaction block (disable your framework's DDL transaction for that migration).
- Slower (two scans, waits for old snapshots), and a failed/cancelled build leaves an **INVALID** index that still taxes every write. Check and clean up before retrying:

```sql
SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;
DROP INDEX CONCURRENTLY IF EXISTS bad_index;  -- then retry the CREATE
```

`IF NOT EXISTS` happily keeps an INVALID index — drop first, then recreate. Use `REINDEX CONCURRENTLY` (PG12+) for bloated indexes. On partitioned tables, `CREATE INDEX CONCURRENTLY` does not work on the parent: create the parent index `ON ONLY parent` (starts invalid), build each child's index concurrently, then `ALTER INDEX ... ATTACH PARTITION` each — the parent turns valid when all children attach.

### Change a column type

Metadata-only (safe with the preamble): widening `varchar(n)`, `varchar` → `text`, raising `numeric` precision at the same scale, `cidr` → `inet`. **Almost everything else rewrites the table under `ACCESS EXCLUSIVE`** (`int` → `bigint`, `text` → `jsonb`, `timestamp` → `timestamptz` when the TZ isn't UTC). For rewriting changes use expand–contract: new column → dual-write → batched backfill → switch reads → drop old.

### Rename a column or table

The DDL is instant, but every deployed app instance breaks the moment it runs (ORM schema caches included). On a live system use expand–contract; for table renames, a transitional view with the old name keeps old code working during cutover. If you accept a coordinated deploy instead, do it knowingly with the lock-retry preamble.

### Drop a column or table

- Order matters: first ship code that no longer references it (ORMs cache columns — mark it ignored), then drop in a later migration. Reverse order throws production exceptions.
- `DROP COLUMN` silently drops indexes and constraints that include the column.
- Before `DROP TABLE`: confirm zero reads (`pg_stat_user_tables.seq_scan`/`idx_scan` deltas over days) and no inbound FKs.

## Backfills

Never one giant `UPDATE`: it holds row locks for the duration, produces a WAL burst that spikes replica lag, and creates every dead tuple at once (a vacuum storm). Batch by primary-key range (never `OFFSET`), commit per batch, throttle, and make it idempotent so it can resume:

```sql
-- each iteration = its own transaction; driver records last_id and loops
UPDATE users SET plan = 'free'
WHERE id > $last_id AND id <= $last_id + 10000
  AND plan IS DISTINCT FROM 'free';
-- COMMIT; sleep 50–500ms; watch replica lag and slow down when it grows
```

Size batches so each statement runs well under a second. Run backfills as throttled background jobs, not deploy-blocking steps — OpenAI rate-limits backfills so strictly they can take over a week, by design. After a big backfill: `VACUUM (ANALYZE) users;`.

## Special case: int → bigint primary key

Monitor sequence headroom before it is an emergency (`SELECT last_value::float / 2147483647 FROM your_seq;`). The online pattern: add `id_new bigint` → keep old/new in sync (trigger) → backfill batches → `CREATE UNIQUE INDEX CONCURRENTLY` → `CHECK (id_new IS NOT NULL) NOT VALID` + `VALIDATE` → one short lock-retry transaction that swaps the PK (`ADD CONSTRAINT ... PRIMARY KEY USING INDEX`, no scan needed) and repoints FKs → drop the old column later. It's a week of careful work — which is why new tables start with `bigint` or UUIDv7.

## Preflight checklist

1. Preamble present (`lock_timeout`, `statement_timeout`, retry on 55P03)?
2. Any operation on the unsafe list above without its safe pattern?
3. Index changes `CONCURRENTLY`, outside a transaction, with INVALID-index cleanup on retry?
4. Constraints added `NOT VALID` first, `VALIDATE` separately?
5. Backfill batched, throttled, idempotent, and separate from DDL?
6. Drops/renames sequenced after the code deploy that stops using them?
7. Long-running queries checked immediately before running?
