alter table "public"."venue_accommodation_details" drop constraint "venue_accommodation_details_pkey";
alter table "public"."venue_accommodation_details"
    add constraint "venue_accomodation_details_pkey"
    primary key ("id");
