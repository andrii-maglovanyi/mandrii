alter table "public"."chains"
  add constraint "chains_category_fkey"
  foreign key (category)
  references "public"."venue_category"
  (value) on update no action on delete no action;
alter table "public"."chains" alter column "category" drop not null;
alter table "public"."chains" add column "category" text;
