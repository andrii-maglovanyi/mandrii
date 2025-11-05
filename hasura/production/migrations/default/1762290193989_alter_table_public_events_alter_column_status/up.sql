ALTER TABLE "public"."events" ALTER COLUMN "status" TYPE text;
alter table "public"."events" alter column "status" set default 'PENDING'::text;
