"use client";

import { Edit2, ExternalLink, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Table, Tooltip } from "~/components/ui";
import { useListControls } from "~/hooks/useListControls";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { GetUserVenuesQuery, Locale } from "~/types";

import { VenueStatus } from "./VenueStatus";

const Venues = () => {
  const router = useRouter();
  const { useUserVenues } = useVenues();
  const { handlePaginate, handleSort, listState } = useListControls();
  const { count, data, error, loading } = useUserVenues(listState);

  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const COLUMNS = [
    {
      align: "center" as const,
      dataIndex: "status",
      key: "status",
      render: (status: unknown) => {
        return <VenueStatus status={status} />;
      },
      sorter: false,
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
              className={`
                group text-2xl font-bold
                md:text-base md:font-semibold
              `}
              href={`/venues/${slug}`}
              target="_blank"
            >
              {String(name)}
              <ExternalLink
                className={`
                  mb-1.5 ml-1 inline-block align-bottom opacity-0
                  group-hover:opacity-100
                  md:mb-0.5
                `}
                size={18}
              />
            </Link>
            <span className={`
              text-base text-neutral-disabled
              md:text-xs
            `}>
              {hasAddress ? `${city}, ${country}` : i18n("Virtual venue")}
            </span>
          </div>
        );
      },
      sorter: true,
      title: i18n("Title"),
      width: "100%",
    },
    {
      align: "center" as const,
      dataIndex: "category",
      key: "category",
      render: (category: unknown) => {
        const { iconName, label } = constants.categories[category as keyof typeof constants.categories];
        return (
          <>
            <div className={`
              hidden grow justify-center align-middle
              md:flex
            `}>
              <Tooltip label={label[locale]}>{getIcon(iconName)}</Tooltip>
            </div>
            <div className={`
              flex items-center
              md:hidden
            `}>
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
