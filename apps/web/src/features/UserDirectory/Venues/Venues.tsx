"use client";

import { ArrowUpRight, Edit2, Plus } from "lucide-react";
import { format } from "date-fns";
import { enUS, uk } from "date-fns/locale";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Button, ContentStatusBadge, Table, Tooltip } from "~/components/ui";
import { useListControls } from "~/hooks/useListControls";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { FilterParams, GetUserVenuesQuery, Locale, Venue_Status_Enum } from "~/types";

import { ContentDirectoryFilters } from "../components/ContentDirectoryFilters";

const SEARCH_DEBOUNCE_MS = 300;
const VENUE_STATUSES = Object.values(Venue_Status_Enum);

const Venues = () => {
  const router = useRouter();
  const { useUserVenues } = useVenues();
  const { handleFilter, handlePaginate, handleSort, listState } = useListControls({
    order_by: [{ status: "desc" }, { updated_at: "desc" }],
  });

  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const dateLocale = locale === "uk" ? uk : enUS;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [status, setStatus] = useState<Venue_Status_Enum>();
  const { count, data, error, loading } = useUserVenues(listState, ownedOnly);
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
          { name: { _ilike: `%${query}%` } },
        ],
      });
    }

    handleFilter(filters.length ? { _and: filters } : {});
  }, [debouncedSearch, handleFilter, ownedOnly, status]);

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
        return <ContentStatusBadge status={status as Venue_Status_Enum} />;
      },
      defaultSortOrder: "desc" as const,
      sorter: true,
      mobile: { fullWidth: true, hideLabel: true },
      title: i18n("Status"),
    },
    {
      dataIndex: "name",
      key: "name",
      render: (name: unknown, { city, country, slug }: GetUserVenuesQuery["venues"][number]) => {
        const hasAddress = Boolean(city && country);

        return (
          <div className="flex flex-col">
            <Link
              className={`group text-xl leading-7 font-bold md:text-base md:font-semibold`}
              href={`/venues/${slug}`}
              target="_blank"
            >
              {String(name)}
              <ArrowUpRight
                className={`text-neutral mb-1.5 ml-0.5 inline-block align-bottom opacity-0 group-hover:opacity-100 md:mb-1`}
                size={16}
              />
            </Link>
            <span className={`text-neutral-disabled text-base md:text-xs`}>
              <strong>{hasAddress ? city : i18n("Virtual venue")}</strong>
              {country ? `, ${country}` : null}
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
      dataIndex: "category",
      key: "category",
      render: (category: unknown) => {
        const { iconName, label } = constants.categories[category as keyof typeof constants.categories];
        return (
          <>
            <div className={`hidden grow justify-center align-middle md:flex`}>
              <Tooltip label={label[locale]}>{getIcon(iconName)}</Tooltip>
            </div>
            <div className={`flex items-center md:hidden`}>
              {getIcon(iconName)} <span className="ml-2">{label[locale]}</span>
            </div>
          </>
        );
      },
      sorter: false,
      title: i18n("Category"),
    },
    {
      dataIndex: "slug",
      key: "slug",
      render: (slug: unknown) => (
        <div className="flex justify-end">
          <Button
            color="primary"
            onClick={() => {
              router.push(`/user-directory/venues/${slug}`);
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
            router.push(`/user-directory/venues`);
          }}
          variant="filled"
        >
          <Plus className="mr-2" />
          {i18n("Add new venue")}
        </Button>
      </div>
      <ContentDirectoryFilters
        onOwnedOnlyChange={setOwnedOnly}
        onSearchChange={handleSearchChange}
        onStatusChange={setStatus}
        ownedOnly={ownedOnly}
        ownedOnlyLabel={i18n("Only venues I own")}
        searchPlaceholder={i18n("Search venues by title or location...")}
        searchQuery={searchQuery}
        status={status}
        statuses={VENUE_STATUSES}
      />
      {error ? (
        error.message
      ) : (
        <Table
          columns={COLUMNS}
          dataSource={data}
          emptyStateBodyMessage={i18n(
            "No venues added yet. Click the button above to add the first one and start managing your venues!",
          )}
          emptyStateHeading={i18n("No venues added yet")}
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
          rowKey="id"
        />
      )}
    </div>
  );
};

export default Venues;
