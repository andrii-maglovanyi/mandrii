"use client";

import { Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import { use } from "react";

import { AnimatedEllipsis, Breadcrumbs, EmptyState } from "~/components/ui";
import { ContentManagementPage } from "~/features/ContentQRCode/ContentManagementPage";
import { useEvents } from "~/hooks/useEvents";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

export default function EventManagementPage({ params }: { params: Promise<{ slug: string }> }) {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { useGetEvent } = useEvents();
  const { slug } = use(params);
  const { data: event, loading } = useGetEvent(slug);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <AnimatedEllipsis size="lg" />
      </div>
    );
  }
  if (!event) {
    return (
      <EmptyState
        body={i18n("The event you're looking for doesn't exist or has been removed")}
        heading={i18n("Event not found")}
        icon={<Calendar size={50} />}
      />
    );
  }
  const title = locale === "uk" ? event.title_uk : event.title_en;

  return (
    <>
      <Breadcrumbs
        items={[
          { title: i18n("Events"), url: "/user-directory#Events" },
          { title, url: `/user-directory/events/${event.slug}` },
          { title: i18n("Manage") },
        ]}
      />
      <h1 className="text-on-surface my-8 text-3xl font-extrabold md:text-5xl">{i18n("Manage event")}</h1>
      <ContentManagementPage targetId={event.id} targetType="event" />
    </>
  );
}
