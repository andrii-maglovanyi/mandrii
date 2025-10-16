"use client";

import { useApolloClient } from "@apollo/client";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ZodError } from "zod";

import { Alert, RichText, Tooltip } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { EmptyState } from "~/components/ui/EmptyState/EmptyState";
import { useNotifications } from "~/hooks/useNotifications";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { toDateLocale } from "~/lib/utils";
import { VenueFormData } from "~/lib/validation/venue";
import { Locale, Status } from "~/types";

import { VenueStatus } from "../VenueStatus";
import { VenueForm } from "./VenueForm";

interface FileOptions {
  name?: string;
  type?: string;
}

interface VenueProps {
  slug?: string;
}

async function createFileFromUrl(url: string, options: FileOptions = {}): Promise<File> {
  const response = await fetch(`${constants.vercelBlobStorageUrl}/${url}`);
  const blob = await response.blob();

  const file = new File([blob], options.name || "file", {
    type: options.type || blob.type,
  });

  return file;
}

async function createFilesFromUrls(urls: string[]): Promise<File[]> {
  const filePromises = urls.map((url) => createFileFromUrl(url, { name: url.split("/").pop() }));
  const files = await Promise.all(filePromises);

  return files;
}

export const EditVenue = ({ slug }: VenueProps) => {
  const client = useApolloClient();
  const { showError, showSuccess } = useNotifications();
  const locale = useLocale() as Locale;
  const i18n = useI18n();
  const router = useRouter();
  const { useGetVenue } = useVenues();

  const { data, error, loading } = useGetVenue(slug);

  const getInitialStatus = (): Status => {
    if (loading) return "processing";
    if (error) return "error";
    return "idle";
  };

  const [formStatus, setFormStatus] = useState<Status>("idle");
  const [loadStatus, setLoadStatus] = useState<Status>(getInitialStatus());
  const [venueFormData, setVenueFormData] = useState<null | Partial<VenueFormData>>(slug ? null : {});
  const [meta, setMeta] = useState<{ createdAt: string; status: string } | null>(null);

  useEffect(() => {
    if (loading) {
      setLoadStatus("processing");
    } else if (error) {
      setLoadStatus("error");
    }
  }, [loading, error]);

  useEffect(() => {
    if (!data?.[0]) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    (async () => {
      setLoadStatus("processing");

      try {
        const { created_at, geo, image_urls, logo_url, social_links, status, ...rest } = data[0];

        const logo = logo_url ? (await createFilesFromUrls([logo_url]))[0] : null;

        let images: File[] = [];
        if (image_urls?.length) {
          try {
            images = await createFilesFromUrls(image_urls);
          } catch {
            showError(i18n("Some images could not be loaded"));
          }
        }

        if (signal.aborted) return;

        setVenueFormData({
          ...rest,
          ...social_links,
          images,
          latitude: geo?.coordinates[1],
          logo,
          longitude: geo?.coordinates[0],
        });

        if (status && created_at) {
          setMeta({ createdAt: created_at, status });
        }

        setLoadStatus("idle");
      } catch {
        if (!signal.aborted) {
          setLoadStatus("error");
        }
      }
    })();

    return () => abortController.abort();
  }, [data, showError, i18n]);

  const handleSubmit = async (data: VenueFormData) => {
    setFormStatus("processing");

    try {
      const body = buildFormData(data);
      const result = await submitVenue(body, locale);

      if (result.ok) {
        await handleSuccess();
      } else {
        await handleError(result);
      }
    } catch {
      setFormStatus("error");
    }
  };

  function buildFormData(data: VenueFormData): FormData {
    const body = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        for (const val of value.filter(Boolean)) {
          body.append(key, val);
        }
        continue;
      }

      if (!value) continue;

      if (value instanceof File) {
        body.append(key, value);
      } else if (typeof value === "object") {
        body.append(key, JSON.stringify(value));
      } else {
        body.append(key, String(value));
      }
    }

    return body;
  }

  async function submitVenue(body: FormData, locale: string) {
    const res = await fetch(`/api/venue/save?locale=${locale}`, {
      body,
      method: "POST",
    });
    const result = await res.json();
    return { errors: result.errors, ok: res.ok };
  }

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

    setFormStatus("idle");
  }

  async function handleError(result: { errors?: ZodError["issues"] }) {
    setFormStatus("error");
    if (result.errors) {
      return result.errors;
    }
  }

  const renderLayout = () => {
    if (loadStatus === "processing") {
      return <AnimatedEllipsis centered size="lg" />;
    }

    if (loadStatus === "error") {
      return <Alert>{i18n("Failed to load venue data")}</Alert>;
    }

    if (venueFormData) {
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
          <VenueForm initialValues={venueFormData} onSubmit={handleSubmit} status={formStatus} />
        </>
      );
    }

    return (
      <EmptyState
        body={i18n("Please check the venue URL and try again, or return to your [venues list]({venues_list_url})", {
          venues_list_url: "/user-directory#Venues",
        })}
        heading={i18n("Could not find that venue")}
        icon={<Search size={50} />}
      />
    );
  };

  return <div className="flex flex-col">{renderLayout()}</div>;
};

export default EditVenue;
