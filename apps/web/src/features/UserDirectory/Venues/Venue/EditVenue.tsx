"use client";

import { useApolloClient } from "@apollo/client";
import { format } from "date-fns";
import { Archive, Bug, CheckCircle2, Search, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { ActionButton, AnimatedEllipsis, EmptyState, RichText, Tooltip } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications, useUser, useVenues } from "~/hooks";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { toDateLocale } from "~/lib/utils";
import { DayOfWeek, Locale, UUID, Venue_Status_Enum } from "~/types";

import { VenueStatus } from "../VenueStatus";
import { VenueForm } from "./VenueForm";

interface VenueProps {
  slug?: string;
}

const mergeSchedules = (venueSchedules: Array<{ close_time: string; day_of_week: string; open_time: string }> = []) => {
  return constants.weekdays
    .map((day) => {
      const daySchedules = venueSchedules.filter((schedule) => schedule.day_of_week === day.full.en);
      return daySchedules.length > 0 ? daySchedules : [{ close_time: "", day_of_week: day.full.en, open_time: "" }];
    })
    .flat() as { close_time: string; day_of_week: DayOfWeek; open_time: string }[];
};

interface ConfirmDialogConfig {
  message: string;
  onConfirm: () => Promise<void> | void;
  title: string;
}

const VenueStatusActions = ({
  i18n,
  openConfirmDialog,
  status,
  updateVenueStatus,
  venueId,
}: {
  i18n: (key: string) => string;
  openConfirmDialog: (config: ConfirmDialogConfig) => void;
  status: Venue_Status_Enum;
  updateVenueStatus: (
    id: UUID,
    status: Venue_Status_Enum,
  ) => Promise<{ data: unknown; error: unknown; loading: boolean }>;
  venueId: UUID;
}) => {
  const actions = [
    {
      color: "primary" as const,
      disabled: status === Venue_Status_Enum.Active,
      icon: <CheckCircle2 />,
      label: i18n("Publish venue"),
      message: i18n("Are you sure you want to publish this venue?"),
      targetStatus: Venue_Status_Enum.Active,
    },
    {
      color: "danger" as const,
      disabled: status === Venue_Status_Enum.Rejected,
      icon: <XCircle />,
      label: i18n("Reject venue"),
      message: i18n("Are you sure you want to reject this venue?"),
      targetStatus: Venue_Status_Enum.Rejected,
    },
    {
      color: "neutral" as const,
      disabled: status === Venue_Status_Enum.Archived,
      icon: <Archive />,
      label: i18n("Archive venue"),
      message: i18n("Are you sure you want to archive this venue?"),
      separator: true,
      targetStatus: Venue_Status_Enum.Archived,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      |
      {actions.map((action, index) => (
        <div className="flex items-center gap-2" key={action.targetStatus}>
          <ActionButton
            aria-label={action.label}
            color={action.color}
            disabled={action.disabled}
            icon={action.icon}
            onClick={() => {
              openConfirmDialog({
                message: action.message,
                onConfirm: async () => {
                  void updateVenueStatus(venueId, action.targetStatus);
                },
                title: action.label,
              });
            }}
            tooltipPosition="left"
            type="button"
            variant="filled"
          />
          {action.separator && index < actions.length - 1 && <span>&bull;</span>}
        </div>
      ))}
    </div>
  );
};

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

  const handleSuccess = useCallback(async () => {
    await client.refetchQueries({
      include: ["GetUserVenues"],
      updateCache(cache) {
        cache.evict({ fieldName: "venues" });
        cache.evict({ fieldName: "venues_aggregate" });
        cache.gc();
      },
    });

    showSuccess(i18n("Venue updated successfully"));
    router.push("/user-directory");

    setTimeout(() => {
      window.location.hash = encodeURIComponent(i18n("Venues"));
    }, 300);
  }, [i18n, router, showSuccess, client]);

  const submitVenue = useCallback(
    async (body: FormData) => {
      const res = await fetch(`/api/venue/save?locale=${locale}`, {
        body,
        method: "POST",
      });

      const result = await res.json();
      return { errors: result.errors, ok: res.ok };
    },
    [locale],
  );

  const initialValues = useMemo(() => {
    if (!data) return {};

    return {
      ...data,
      is_owner: Boolean(data.owner_id),
      is_physical: Boolean(data.geo?.coordinates),
      name: data.name || "",
      slug: data.slug || "",
      ...(data.social_links ?? {}),
      venue_accommodation_details: {
        ...data.venue_accommodation_details?.[0],
        amenities: (data.venue_accommodation_details?.[0]?.amenities ||
          []) as (typeof constants.options.AMENITIES)[number]["value"][],
      },
      venue_beauty_salon_details: {
        ...data.venue_beauty_salon_details?.[0],
        services: (data.venue_beauty_salon_details?.[0]?.services ||
          []) as (typeof constants.options.BEAUTY_SERVICES)[number]["value"][],
      },
      venue_restaurant_details: {
        ...data.venue_restaurant_details?.[0],
        features: (data.venue_restaurant_details?.[0]?.features ||
          []) as (typeof constants.options.FEATURES)[number]["value"][],
        price_range: (data.venue_restaurant_details?.[0]?.price_range || null) as
          | (typeof constants.options.PRICE_RANGE)[number]["value"]
          | null,
      },
      venue_schedules: mergeSchedules(data.venue_schedules),
      venue_school_details: {
        ...data.venue_school_details?.[0],
        age_groups: (data.venue_school_details?.[0]?.age_groups ||
          []) as (typeof constants.options.AGE_GROUPS)[number]["value"][],
        languages_taught: (data.venue_school_details?.[0]?.languages_taught ||
          []) as (typeof constants.options.LANGUAGES)[number]["value"][],
        subjects: (data.venue_school_details?.[0]?.subjects ||
          []) as (typeof constants.options.CURRICULUM)[number]["value"][],
      },
      venue_shop_details: {
        ...data.venue_shop_details?.[0],
        payment_methods: (data.venue_shop_details?.[0]?.payment_methods ||
          []) as (typeof constants.options.PAYMENT)[number]["value"][],
        product_categories: (data.venue_shop_details?.[0]?.product_categories ||
          []) as (typeof constants.options.PRODUCT_CATEGORIES)[number]["value"][],
      },
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <AnimatedEllipsis centered size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <EmptyState
          body={i18n("An unexpected error occurred. Please try again later.")}
          heading={i18n("Something went wrong")}
          icon={<Bug size={50} />}
        />
      </div>
    );
  }

  if (!data && slug) {
    return (
      <div className="flex flex-col">
        <EmptyState
          body={i18n("Please check the venue URL and try again, or return to your [venues list]({venues_list_url})", {
            venues_list_url: "/user-directory#Venues",
          })}
          heading={i18n("Could not find that venue")}
          icon={<Search size={50} />}
        />
      </div>
    );
  }

  const isAdmin = profileData?.role === "admin";

  return (
    <div className="flex flex-col">
      !!!
      {data && (
        <div className={`
          flex cursor-default items-center justify-end space-x-3 text-sm
          text-neutral-disabled
        `}>
          <Tooltip label={i18n("Created on")}>
            {format(new Date(data.created_at), "dd MMMM yyyy", { locale: toDateLocale(locale) })}
          </Tooltip>
          <span>&bull;</span>
          <VenueStatus status={data.status!} />
          {isAdmin && (
            <VenueStatusActions
              i18n={i18n}
              openConfirmDialog={openConfirmDialog}
              status={data.status!}
              updateVenueStatus={updateVenueStatus}
              venueId={data.id}
            />
          )}
        </div>
      )}
      <RichText as="div" className="mb-6 text-sm text-neutral">
        {slug
          ? i18n(
              "Edit your venue details below.<br/>You can update all fields except the slug, which is locked after the first creation.",
            )
          : i18n(
              "Start adding your venue by selecting its category and name.<br/>The slug is auto-generated the URL and can only be edited during the first creation.",
            )}
      </RichText>
      <VenueForm initialValues={initialValues} onSubmit={submitVenue} onSuccess={handleSuccess} />
    </div>
  );
};

export default EditVenue;
