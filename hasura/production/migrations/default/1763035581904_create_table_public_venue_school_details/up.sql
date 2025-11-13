CREATE TABLE "public"."venue_school_details" ("venue_id" uuid NOT NULL, "class_size_max" integer, "online_classes_available" boolean, "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("venue_id") , FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON UPDATE cascade ON DELETE cascade);
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_venue_school_details_updated_at"
BEFORE UPDATE ON "public"."venue_school_details"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_venue_school_details_updated_at" ON "public"."venue_school_details"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
