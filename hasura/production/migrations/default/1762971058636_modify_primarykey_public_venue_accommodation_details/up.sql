BEGIN TRANSACTION;
ALTER TABLE "public"."venue_accommodation_details" DROP CONSTRAINT "venue_accomodation_details_pkey";

ALTER TABLE "public"."venue_accommodation_details"
    ADD CONSTRAINT "venue_accomodation_details_pkey" PRIMARY KEY ("venue_id");
COMMIT TRANSACTION;
