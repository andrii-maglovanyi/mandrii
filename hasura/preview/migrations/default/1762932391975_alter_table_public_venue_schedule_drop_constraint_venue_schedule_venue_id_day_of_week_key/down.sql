alter table "public"."venue_schedule" add constraint "venue_schedule_venue_id_day_of_week_key" unique ("venue_id", "day_of_week");
