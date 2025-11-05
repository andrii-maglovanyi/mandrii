comment on column "public"."events"."image" is E'Events at Ukrainian venues or custom locations';
alter table "public"."events" alter column "image" drop not null;
alter table "public"."events" add column "image" text;
