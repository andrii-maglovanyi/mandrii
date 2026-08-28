"use client";

import { AnimatedEllipsis, Breadcrumbs, EmptyState } from "~/components/ui";
import { MapPin } from "lucide-react";
import { use } from "react";
import { ContentAnalyticsPage } from "~/features/ContentQRCode/ContentAnalyticsPage";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";

export default function VenueAnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const i18n = useI18n();
  const { useGetVenue } = useVenues();
  const { slug } = use(params);
  const { data: venue, loading } = useGetVenue(slug);
  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center">
        <AnimatedEllipsis size="lg" />
      </div>
    );
  if (!venue)
    return (
      <EmptyState
        body={i18n("The venue you're looking for doesn't exist or has been removed")}
        heading={i18n("Venue not found")}
        icon={<MapPin size={50} />}
      />
    );
  return (
    <>
      <Breadcrumbs
        items={[
          { title: i18n("Venues"), url: "/user-directory#Venues" },
          { title: venue.name, url: `/user-directory/venues/${venue.slug}` },
          { title: i18n("Analytics") },
        ]}
      />
      <ContentAnalyticsPage targetId={venue.id} targetType="venue" />
    </>
  );
}
