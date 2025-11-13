ALTER TABLE venue_schedule
ADD CONSTRAINT venue_schedule_venue_id_day_of_week_key
UNIQUE (venue_id, day_of_week);
