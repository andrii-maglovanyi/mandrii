CREATE TABLE "public"."venue_restaurant_details" ("venue_id" uuid NOT NULL, "updated_at" timestamptz NOT NULL DEFAULT now(), "price_range" text NOT NULL, "seating_capacity" integer NOT NULL, PRIMARY KEY ("venue_id") , FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON UPDATE cascade ON DELETE cascade);
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
CREATE TRIGGER "set_public_venue_restaurant_details_updated_at"
BEFORE UPDATE ON "public"."venue_restaurant_details"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_venue_restaurant_details_updated_at" ON "public"."venue_restaurant_details"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
