"use client";

import { format } from "date-fns";
import { enUS, uk } from "date-fns/locale";
import { ArrowUpRight, Calendar, Edit2, Headset, LayoutDashboard, Map, MapPin, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Button, ContentStatusBadge, Table, Tooltip } from "~/components/ui";
import { useEvents } from "~/hooks/useEvents";
import { useListControls } from "~/hooks/useListControls";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { Event_Status_Enum, FilterParams, GetPublicEventsQuery, Locale } from "~/types";

import { ContentDirectoryFilters } from "../components/ContentDirectoryFilters";

const SEARCH_DEBOUNCE_MS = 300;
const EVENT_STATUSES = Object.values(Event_Status_Enum);

const Events = () => {
  const router = useRouter();
  const { useUserEvents } = useEvents();
  const { handleFilter, handlePaginate, handleSort, listState } = useListControls({
    order_by: [{ status: "asc" }, { updated_at: "desc" }],
  });
  const { count, data, error, loading } = useUserEvents(listState);

  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const dateLocale = locale === "uk" ? uk : enUS;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<Event_Status_Enum>();
  const debouncedSetSearch = useDebouncedCallback((value: string) => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const filters: FilterParams[] = [];
    const query = debouncedSearch.trim();

    if (status) filters.push({ status: { _eq: status } });
    if (query) {
      filters.push({
        _or: [
          { city: { _ilike: `%${query}%` } },
          { country: { _ilike: `%${query}%` } },
          { custom_location_name: { _ilike: `%${query}%` } },
          { title_en: { _ilike: `%${query}%` } },
          { title_uk: { _ilike: `%${query}%` } },
          { venue: { name: { _ilike: `%${query}%` } } },
        ],
      });
    }

    handleFilter(filters.length ? { _and: filters } : {});
  }, [debouncedSearch, handleFilter, status]);

  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const COLUMNS = [
    {
      align: "center" as const,
      dataIndex: "status",
      key: "status",
      render: (status: unknown) => {
        return <ContentStatusBadge status={status as Event_Status_Enum} />;
      },
      defaultSortOrder: "asc" as const,
      sorter: true,
      mobile: { fullWidth: true, hideLabel: true },
      title: i18n("Status"),
    },
    {
      dataIndex: "title_en",
      key: "title_en",
      render: (
        _: unknown,
        {
          city,
          country,
          custom_location_name,
          is_online,
          slug,
          start_date,
          title_en,
          title_uk,
          venue,
        }: GetPublicEventsQuery["events"][number],
      ) => {
        let locationInfo = <>{i18n("Location TBD")}</>;

        if (is_online) {
          locationInfo = (
            <>
              <Headset size={14} /> {i18n("Online")}
              {venue ? (
                <Link className="underline" href={`/venues/${venue.slug}`} target="_blank">
                  {venue.name}
                </Link>
              ) : null}
            </>
          );
        } else if (venue) {
          locationInfo = (
            <>
              <LayoutDashboard size={14} />{" "}
              <Link className="underline" href={`/venues/${venue.slug}`} target="_blank">
                {venue.name}
              </Link>
            </>
          );
        } else if (custom_location_name) {
          locationInfo = (
            <>
              <MapPin size={14} /> {custom_location_name}
            </>
          );
        } else if (city && country) {
          locationInfo = (
            <>
              <Map size={14} /> {`${city}, ${country}`}
            </>
          );
        }

        return (
          <div className="flex flex-col">
            <Link
              className={`group text-xl leading-7 font-bold md:text-base md:font-semibold`}
              href={`/events/${slug}`}
              target="_blank"
            >
              {locale === "uk" ? title_uk : title_en}
              <ArrowUpRight
                className={`text-neutral mb-1.5 ml-0.5 inline-block align-bottom opacity-0 group-hover:opacity-100 md:mb-1`}
                size={16}
              />
            </Link>
            <span className={`text-neutral-disabled flex flex-wrap items-center gap-x-2 gap-y-1 text-sm md:text-xs`}>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Calendar size={14} />
                {format(new Date(start_date), "PPP", { locale: dateLocale })}
              </span>
              <span aria-hidden="true">•</span>
              <span className="flex min-w-0 items-center gap-1">{locationInfo}</span>
            </span>
          </div>
        );
      },
      sorter: true,
      mobile: { fullWidth: true, hideLabel: true },
      title: i18n("Title"),
      width: "100%",
    },
    {
      align: "center" as const,
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updatedAt: unknown) => (
        <time className="inline-block text-sm whitespace-nowrap" dateTime={String(updatedAt)}>
          {format(new Date(String(updatedAt)), "dd MMM yyyy", { locale: dateLocale })}
        </time>
      ),
      defaultSortOrder: "desc" as const,
      sorter: true,
      title: i18n("Last updated"),
    },
    {
      align: "center" as const,
      dataIndex: "type",
      key: "type",
      render: (eventType: unknown) => {
        const { iconName, label } = constants.eventTypes[eventType as keyof typeof constants.eventTypes];

        return (
          <>
            <div className={`hidden grow justify-center align-middle md:flex`}>
              <Tooltip label={label[locale]}>{getIcon(iconName)}</Tooltip>
            </div>
            <div className={`flex items-center md:hidden`}>
              {getIcon(iconName)}
              <span className="ml-2">{label[locale]}</span>
            </div>
          </>
        );
      },
      sorter: false,
      title: i18n("Type"),
    },
    {
      dataIndex: "slug",
      key: "slug",
      render: (slug: unknown) => (
        <div className="flex justify-end">
          <Button
            color="primary"
            onClick={() => {
              router.push(`/user-directory/events/${slug}`);
            }}
            variant="outlined"
          >
            <Edit2 className="mr-2" size={18} /> {i18n("Edit")}
          </Button>
        </div>
      ),
      mobile: { fullWidth: true, hideLabel: true },
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex justify-end">
        <Button
          color="primary"
          onClick={() => {
            router.push(`/user-directory/events`);
          }}
          variant="filled"
        >
          <Plus className="mr-2" />
          {i18n("Add new event")}
        </Button>
      </div>
      <ContentDirectoryFilters
        onSearchChange={handleSearchChange}
        onStatusChange={setStatus}
        searchPlaceholder={i18n("Search events by title or location...")}
        searchQuery={searchQuery}
        status={status}
        statuses={EVENT_STATUSES}
      />
      {error ? (
        error.message
      ) : (
        <Table
          columns={COLUMNS}
          dataSource={data}
          emptyStateBodyMessage={i18n(
            "No events added yet. Click the button above to add the first one and start managing your events!",
          )}
          emptyStateHeading={i18n("No events added yet")}
          loading={loading}
          onSort={handleSort}
          pagination={{
            count,
            currentOffset: listState.offset,
            nextText: i18n("Next"),
            onPaginate: handlePaginate,
            pageSize: listState.limit,
            prevText: i18n("Back"),
          }}
          rowKey="slug"
        />
      )}
    </div>
  );
};

export default Events;
