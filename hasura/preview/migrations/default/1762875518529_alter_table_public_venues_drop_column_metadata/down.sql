alter table "public"."venues" alter column "metadata" set default '{}'::json;
alter table "public"."venues" alter column "metadata" drop not null;
alter table "public"."venues" add column "metadata" json;
