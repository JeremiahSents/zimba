-- platform_audit_log carried two foreign keys per user column: the ones Postgres
-- named itself in 0009 ("..._fkey") and the ones drizzle later added under its
-- own convention ("..._user_id_fk"). Postgres enforces every constraint it has,
-- so the pair on actor_id disagreed and the strictest rule won: 0018 relaxed the
-- drizzle constraint to SET NULL to keep an admin's history when their account is
-- deleted, but the leftover _fkey still said CASCADE, which would have deleted
-- those audit rows anyway.
--
-- drizzle-kit generate cannot emit this: the _fkey constraints were never in its
-- snapshot, so its diff does not know they exist.
--
-- Dropping the duplicates leaves exactly the constraints the TS schema declares.
-- No data moves — a redundant foreign key carries no rows of its own.

ALTER TABLE "platform_audit_log" DROP CONSTRAINT IF EXISTS "platform_audit_log_actor_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_audit_log" DROP CONSTRAINT IF EXISTS "platform_audit_log_target_user_id_fkey";
