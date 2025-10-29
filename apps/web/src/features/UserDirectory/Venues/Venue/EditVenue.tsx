"use client";

import { useApolloClient } from "@apollo/client";
import { format } from "date-fns";
import { Ban, Bug, Rocket, Search } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RichText, Tooltip } from "~/components/ui";
import { ActionButton } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { EmptyState } from "~/components/ui/EmptyState/EmptyState";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { toDateLocale } from "~/lib/utils";
import { Locale, Venue_Status_Enum } from "~/types";

import { VenueStatus } from "../VenueStatus";
import { VenueForm } from "./VenueForm";

interface VenueProps {
  slug?: string;
}

export const EditVenue = ({ slug }: VenueProps) => {
  const client = useApolloClient();
  const { showSuccess } = useNotifications();
  const locale = useLocale() as Locale;
  const i18n = useI18n();
  const router = useRouter();
  const { updateVenueStatus, useGetVenue } = useVenues();

  const { data: profileData } = useUser();
  const { data, error, loading } = useGetVenue(slug);

  const [meta, setMeta] = useState<{ createdAt: string; status: string } | null>(null);

  useEffect(() => {
    if (data?.length) {
      setMeta({
        createdAt: data[0].created_at,
        status: data[0].status!,
      });
    }
  }, [data]);

  async function handleSuccess() {
    showSuccess(i18n("Venue updated successfully"));
    router.push(`/user-directory#${i18n("Venues")}`);

    await client.refetchQueries({
      include: ["GetUserVenues"],
      updateCache(cache) {
        cache.evict({ fieldName: "venues" });
        cache.evict({ fieldName: "venues_aggregate" });
        cache.gc();
      },
    });
  }

  async function submitVenue(body: FormData) {
    const res = await fetch(`/api/venue/save?locale=${locale}`, {
      body,
      method: "POST",
    });

    const result = await res.json();

    return { errors: result.errors, ok: res.ok };
  }

  const renderLayout = () => {
    if (loading) {
      return <AnimatedEllipsis centered size="md" />;
    }

    if (error) {
      return (
        <EmptyState
          body={i18n("An unexpected error occurred. Please try again later.")}
          heading={i18n("Something went wrong")}
          icon={<Bug size={50} />}
        />
      );
    }

    if (!data.length && slug) {
      return (
        <EmptyState
          body={i18n("Please check the venue URL and try again, or return to your [venues list]({venues_list_url})", {
            venues_list_url: "/user-directory#Venues",
          })}
          heading={i18n("Could not find that venue")}
          icon={<Search size={50} />}
        />
      );
    }

    return (
      <>
        {meta ? (
          <div className={`
            flex cursor-default items-center justify-end space-x-3 text-sm
            text-neutral-disabled
          `}>
            <Tooltip label={i18n("Created on")}>
              {format(new Date(meta.createdAt), "dd MMMM yyyy", { locale: toDateLocale(locale) })}
            </Tooltip>
            <span>&bull;</span>
            <VenueStatus expanded status={meta.status} />
            {profileData?.role === "admin" && (
              <div className="flex gap-2">
                <ActionButton
                  aria-label={i18n("Publish venue")}
                  color="primary"
                  disabled={meta.status === Venue_Status_Enum.Active}
                  icon={<Rocket />}
                  onClick={() => {
                    updateVenueStatus(data[0].id, Venue_Status_Enum.Active);
                  }}
                  tooltipPosition="left"
                  type="button"
                  variant="filled"
                />
                <ActionButton
                  aria-label={i18n("Reject venue")}
                  color="danger"
                  disabled={meta.status === Venue_Status_Enum.Rejected}
                  icon={<Ban />}
                  onClick={() => {
                    updateVenueStatus(data[0].id, Venue_Status_Enum.Rejected);
                  }}
                  tooltipPosition="left"
                  type="button"
                  variant="filled"
                />
              </div>
            )}
          </div>
        ) : null}
        <RichText as="p" className="mb-6 text-sm text-neutral">
          {slug
            ? i18n(
                "Edit your venue details below.<br/>You can update all fields except the slug, which is locked after the first creation.",
              )
            : i18n(
                "Start adding your venue by selecting its category and name.<br/>The slug is auto-generated the URL and can only be edited during the first creation.",
              )}
        </RichText>
        <VenueForm
          initialValues={{ ...data[0], is_owner: Boolean(data[0]?.owner_id), ...(data[0]?.social_links ?? {}) }}
          onSubmit={submitVenue}
          onSuccess={handleSuccess}
        />
      </>
    );
  };

  return <div className="flex flex-col">{renderLayout()}</div>;
};

export default EditVenue;
