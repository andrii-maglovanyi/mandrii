"use client";

import { useApolloClient } from "@apollo/client";
import { format } from "date-fns";
import { Archive, Bug, CheckCircle2, Search, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ActionButton, AnimatedEllipsis, EmptyState, RichText, Tooltip } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useEvents, useNotifications, useUser } from "~/hooks";
import { useI18n } from "~/i18n/useI18n";
import { toDateLocale } from "~/lib/utils";
import { Event_Status_Enum, Locale } from "~/types";

import { EventStatus } from "../EventStatus";
import { EventForm } from "./EventForm";

interface EventProps {
  slug?: string;
}

export const EditEvent = ({ slug }: EventProps) => {
  const client = useApolloClient();
  const { showSuccess } = useNotifications();
  const locale = useLocale() as Locale;
  const i18n = useI18n();
  const router = useRouter();
  const { updateEventStatus, useGetEvent } = useEvents();
  const { openConfirmDialog } = useDialog();

  const { data: profileData } = useUser();
  const { data, error, loading } = useGetEvent(slug);
  const [meta, setMeta] = useState<{ createdAt: string; status: Event_Status_Enum } | null>(null);

  useEffect(() => {
    if (data) {
      setMeta({
        createdAt: data.created_at,
        status: data.status,
      });
    }
  }, [data]);

  const handleSuccess = useCallback(async () => {
    showSuccess(i18n("Event updated successfully"));
    router.push(`/user-directory#${i18n("Events")}`);

    await client.refetchQueries({
      include: ["GetUserEvents"],
      updateCache(cache) {
        cache.evict({ fieldName: "events" });
        cache.evict({ fieldName: "events_aggregate" });
        cache.gc();
      },
    });
  }, [i18n, router, showSuccess, client]);

  const submitEvent = useCallback(
    async (body: FormData) => {
      const res = await fetch(`/api/event/save?locale=${locale}`, {
        body,
        method: "POST",
      });

      const result = await res.json();

      return { errors: result.errors, ok: res.ok };
    },
    [locale],
  );

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
          body={i18n("Please check the event URL and try again, or return to your [events list]({events_list_url})", {
            events_list_url: "/user-directory#Events",
          })}
          heading={i18n("Could not find that event")}
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
            <EventStatus status={meta.status} />
            {profileData?.role === "admin" && (
              <div className="flex items-center gap-2">
                |
                <ActionButton
                  aria-label={i18n("Publish event")}
                  color="primary"
                  disabled={meta.status === Event_Status_Enum.Active}
                  icon={<CheckCircle2 />}
                  onClick={() => {
                    openConfirmDialog({
                      message: i18n("Are you sure you want to publish this event?"),
                      onConfirm: () => {
                        updateEventStatus(data.id, Event_Status_Enum.Active);
                      },
                      title: i18n("Publish event"),
                    });
                  }}
                  tooltipPosition="left"
                  type="button"
                  variant="filled"
                />
                <ActionButton
                  aria-label={i18n("Cancel event")}
                  color="danger"
                  disabled={meta.status === Event_Status_Enum.Cancelled}
                  icon={<XCircle />}
                  onClick={() => {
                    openConfirmDialog({
                      message: i18n("Are you sure you want to cancel this event?"),
                      onConfirm: () => {
                        updateEventStatus(data.id, Event_Status_Enum.Cancelled);
                      },
                      title: i18n("Cancel event"),
                    });
                  }}
                  tooltipPosition="left"
                  type="button"
                  variant="filled"
                />
                <span>&bull;</span>
                <ActionButton
                  aria-label={i18n("Archive event")}
                  color="neutral"
                  disabled={meta.status === Event_Status_Enum.Archived}
                  icon={<Archive />}
                  onClick={() => {
                    openConfirmDialog({
                      message: i18n("Are you sure you want to archive this event?"),
                      onConfirm: () => {
                        updateEventStatus(data.id, Event_Status_Enum.Archived);
                      },
                      title: i18n("Archive event"),
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
                "Edit your event details below.<br/>You can update all fields except the slug, which is locked after the first creation.",
              )
            : i18n(
                "Start adding your event by entering its title and type.<br/>The slug is auto-generated from the title and can only be edited during the first creation.",
              )}
        </RichText>
        <EventForm
          initialValues={{
            ...data,
            is_online: Boolean(data?.is_online),
            is_recurring: Boolean(data?.recurrence_rule),
            registration_required: Boolean(data?.registration_required),
            ...(data?.social_links ?? {}),
          }}
          onSubmit={submitEvent}
          onSuccess={handleSuccess}
        />
      </>
    );
  };

  return <div className="flex flex-col">{renderLayout()}</div>;
};
