alter table "public"."venue_accomodation_details"
  add constraint "venue_accomodation_details_venue_id_fkey"
  foreign key ("venue_id")
  references "public"."venues"
  ("id") on update cascade on delete cascade;
