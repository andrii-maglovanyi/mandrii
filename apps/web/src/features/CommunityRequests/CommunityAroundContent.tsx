"use client";

import { HandHeart, Handshake, MapPin, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge, TextLink } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { CommunityRequest } from "~/lib/community-requests/types";

type CommunityAroundContentProps = {
  targetId: string;
  targetType: "event" | "venue";
};

export function CommunityAroundContent({ targetId, targetType }: CommunityAroundContentProps) {
  const i18n = useI18n();
  const targetKey = `${targetType}:${targetId}`;
  const [result, setResult] = useState<{ key: string; requests: CommunityRequest[] } | null>(null);
  const requests = result?.key === targetKey ? result.requests : null;

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/community-requests?${targetType}Id=${encodeURIComponent(targetId)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load community posts");
        return (await response.json()) as CommunityRequest[];
      })
      .then((requests) => {
        if (!controller.signal.aborted) setResult({ key: targetKey, requests });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setResult({ key: targetKey, requests: [] });
      });

    return () => controller.abort();
  }, [targetId, targetType, targetKey]);

  if (!requests?.length) return null;

  return (
    <section className={`
      mt-8 rounded-2xl border border-primary/15 bg-surface-tint/35 p-4
      sm:p-5
    `}>
      <div className={`
        mb-4 flex flex-col justify-between gap-3
        sm:flex-row sm:items-center
      `}>
        <div>
          <div className={`
            flex items-center gap-2 text-sm font-semibold text-primary
          `}>
            <UsersRound aria-hidden size={17} />
            {i18n("Community")}
          </div>
          <h3 className="mt-1 text-lg font-bold text-on-surface">
            {i18n(targetType === "venue" ? "Community around this venue" : "Community around this event")}
          </h3>
        </div>
        <TextLink className="font-semibold" href="/community">
          {i18n("View Community")}
        </TextLink>
      </div>
      <div className={`
        grid gap-3
        md:grid-cols-2
      `}>
        {requests.map((request) => (
          <article className="rounded-xl bg-surface p-4 shadow-sm" key={request.id}>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge
                icon={request.kind === "REQUEST" ? <HandHeart size={12} /> : <Handshake size={12} />}
                variant={request.kind === "REQUEST" ? "info" : "success"}
              >
                {request.kind === "REQUEST" ? i18n("Needs help") : i18n("Can help")}
              </Badge>
            </div>
            <h4 className="font-bold text-on-surface">{request.title}</h4>
            <p className={`
              mt-1 line-clamp-2 text-sm leading-relaxed text-neutral
            `}>{request.body}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral">
              <MapPin aria-hidden size={14} />
              {[request.location, request.country].filter(Boolean).join(", ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
