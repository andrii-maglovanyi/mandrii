ALTER TABLE events
ADD CONSTRAINT events_status_fkey
FOREIGN KEY (status) REFERENCES event_status(value);
