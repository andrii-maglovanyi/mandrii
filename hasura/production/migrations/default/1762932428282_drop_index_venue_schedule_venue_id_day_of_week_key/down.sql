CREATE  INDEX "venue_schedule_venue_id_day_of_week_key" on
  "public"."venue_schedule" using btree ("day_of_week", "venue_id");
