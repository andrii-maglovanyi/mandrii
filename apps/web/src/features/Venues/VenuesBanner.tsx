"use client";

import { Map } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

export const VenuesBanner = () => {
  const router = useRouter();
  const i18n = useI18n();
  return (
    <div className={`from-primary to-secondary mt-8 rounded-lg bg-linear-to-r p-px`}>
      <div
        className={`flex flex-col space-y-6 rounded-lg bg-white p-6 md:flex-row md:space-y-0 md:space-x-4 dark:bg-black`}
      >
        <div className="flex-1">
          <h3 className="text-2xl font-bold">{i18n("Let's unite, Ukrainians!")}</h3>
          <p className="mt-4">
            {i18n("Discover Ukrainian businesses, restaurants, cultural center and community hubs across Europe.")}
          </p>
          <p className="mt-2">
            {i18n(
              "Whether you're looking for a familiar place, a taste of home, feeling of unity or ways to support own people abroad - this map helps you to find and contribute to the community.",
            )}
          </p>
        </div>
        <div className={`flex shrink-0 items-center justify-center md:ml-auto md:min-w-max`}>
          <Button
            className={`mndr-with-gradient-shadow w-full md:w-auto`}
            color="primary"
            isFeatured
            onClick={() => {
              router.push("/map");
            }}
            size="lg"
          >
            <Map className="mr-2" />
            {i18n("Explore the Map")}
          </Button>
        </div>
      </div>
    </div>
  );
};
