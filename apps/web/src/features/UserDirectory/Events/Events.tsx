"use client";

import { format } from "date-fns";
import { enUS, uk } from "date-fns/locale";
import { ArrowUpRight, Calendar, Edit2, Headset, LayoutDashboard, Map, MapPin, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Table, Tooltip } from "~/components/ui";
import { useEvents } from "~/hooks/useEvents";
import { useListControls } from "~/hooks/useListControls";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { Locale } from "~/types";

import { EventStatus } from "./EventStatus";

const Events = () => {
  const router = useRouter();
  const { useUserEvents } = useEvents();
  const { handlePaginate, handleSort, listState } = useListControls();
  const { count, data, error, loading } = useUserEvents(listState);

  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const dateLocale = locale === "uk" ? uk : enUS;

  const COLUMNS = [
    {
      align: "center" as const,
      dataIndex: "status",
      key: "status",
      render: (status: unknown) => {
        return <EventStatus status={status} />;
      },
      sorter: false,
      title: i18n("Status"),
    },
    {
      dataIndex: "title",
      key: "title",
      render: (
        title: unknown,
        {
          city,
          country,
          custom_location_name,
          is_online,
          slug,
          start_date,
          venue,
        }: {
          city: null | string;
          country: null | string;
          custom_location_name: null | string;
          is_online: boolean;
          slug: string;
          start_date: string;
          venue?: { name: string; slug: string } | null;
        },
      ) => {
        let locationInfo = <>{i18n("Location TBD")}</>;

        if (is_online) {
          locationInfo = (
            <>
              <Headset size={14} /> {i18n("Online")}
            </>
          );
        } else if (venue) {
          locationInfo = (
            <>
              <LayoutDashboard size={14} />{" "}
              <Link className="underline" href={`/user-directory/venues/${venue.slug}`} target="_blank">
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
              className={`
                group text-2xl font-bold
                md:text-base md:font-semibold
              `}
              href={`/events/${slug}`}
              target="_blank"
            >
              {String(title)}
              <ArrowUpRight
                className={`
                  mb-1.5 ml-0.5 inline-block align-bottom text-neutral opacity-0
                  group-hover:opacity-100
                  md:mb-1
                `}
                size={16}
              />
            </Link>
            <span className={`
              flex items-center text-base text-neutral-disabled
              md:text-xs
            `}>
              <Calendar className="mr-1" size={14} />
              {format(new Date(start_date), "PPP", { locale: dateLocale })}
              <span className="mx-2">•</span>
              <div className="flex items-center gap-1">{locationInfo}</div>
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
      dataIndex: "type",
      key: "type",
      render: (eventType: unknown) => {
        const { iconName, label } = constants.eventTypes[eventType as keyof typeof constants.eventTypes];

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
      {error ? (
        error.message
      ) : (
        <Table
          columns={COLUMNS}
          dataSource={(data as never[]) || []}
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
