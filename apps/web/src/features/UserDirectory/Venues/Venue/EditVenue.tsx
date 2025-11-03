"use client";

import { useApolloClient } from "@apollo/client";
import { format } from "date-fns";
import { Archive, Bug, CheckCircle2, Search, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RichText, Tooltip } from "~/components/ui";
import { ActionButton } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { EmptyState } from "~/components/ui/EmptyState/EmptyState";
import { useDialog } from "~/contexts/DialogContext";
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
  const { openConfirmDialog } = useDialog();

  const { data: profileData } = useUser();
  const { data, error, loading } = useGetVenue(slug);

  const [meta, setMeta] = useState<{ createdAt: string; status: string } | null>(null);

  useEffect(() => {
    if (data) {
      setMeta({
        createdAt: data.created_at,
        status: data.status!,
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
    console.log(">>>body", body);
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

    if (!data && slug) {
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
        {data && meta ? (
          <div className={`
            flex cursor-default items-center justify-end space-x-3 text-sm
            text-neutral-disabled
          `}>
            <Tooltip label={i18n("Created on")}>
              {format(new Date(meta.createdAt), "dd MMMM yyyy", { locale: toDateLocale(locale) })}
            </Tooltip>
            <span>&bull;</span>
            <VenueStatus status={meta.status} />
            {profileData?.role === "admin" && (
              <div className="flex items-center gap-2">
                |
                <ActionButton
                  aria-label={i18n("Publish venue")}
                  color="primary"
                  disabled={meta.status === Venue_Status_Enum.Active}
                  icon={<CheckCircle2 />}
                  onClick={() => {
                    openConfirmDialog({
                      message: i18n("Are you sure you want to publish this venue?"),
                      onConfirm: () => {
                        updateVenueStatus(data.id, Venue_Status_Enum.Active);
                      },
                      title: i18n("Publish venue"),
                    });
                  }}
                  tooltipPosition="left"
                  type="button"
                  variant="filled"
                />
                <ActionButton
                  aria-label={i18n("Reject venue")}
                  color="danger"
                  disabled={meta.status === Venue_Status_Enum.Rejected}
                  icon={<XCircle />}
                  onClick={() => {
                    openConfirmDialog({
                      message: i18n("Are you sure you want to reject this venue?"),
                      onConfirm: () => {
                        updateVenueStatus(data.id, Venue_Status_Enum.Rejected);
                      },
                      title: i18n("Reject venue"),
                    });
                  }}
                  tooltipPosition="left"
                  type="button"
                  variant="filled"
                />
                <span>&bull;</span>
                <ActionButton
                  aria-label={i18n("Archive venue")}
                  color="neutral"
                  disabled={meta.status === Venue_Status_Enum.Archived}
                  icon={<Archive />}
                  onClick={() => {
                    openConfirmDialog({
                      message: i18n("Are you sure you want to archive this venue?"),
                      onConfirm: () => {
                        updateVenueStatus(data.id, Venue_Status_Enum.Archived);
                      },
                      title: i18n("Archive venue"),
                    });
                  }}
                  tooltipPosition="left"
                  type="button"
                  variant="filled"
                />
              </div>
            )}
          </div>
        ) : null}
        <RichText as="div" className="mb-6 text-sm text-neutral">
          {slug
            ? i18n(
                "Edit your venue details below.<br/>You can update all fields except the slug, which is locked after the first creation.",
              )
            : i18n(
                "Start adding your venue by selecting its category and name.<br/>The slug is auto-generated the URL and can only be edited during the first creation.",
              )}
        </RichText>
        <VenueForm
          initialValues={{
            ...data,
            is_owner: Boolean(data?.owner_id),
            is_physical: Boolean(data?.geo?.coordinates),
            ...(data?.social_links ?? {}),
          }}
          onSubmit={submitVenue}
          onSuccess={handleSuccess}
        />
      </>
    );
  };

  return <div className="flex flex-col">{renderLayout()}</div>;
};

export default EditVenue;
