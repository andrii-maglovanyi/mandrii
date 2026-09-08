"use client";

import { Bell, CalendarDays, Check, ChevronRight, MapPin, Sparkles, Store, Trash2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback, useRef, useState } from "react";

import {
  AccordionItem,
  ActionButton,
  Button,
  Checkbox,
  Dropdown,
  EmptyState,
  MultipleAccordion,
  TextLink,
} from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { Link } from "~/i18n/navigation";
import type { ContentSubscription, ContentSubscriptionPreferences } from "~/lib/content-subscriptions/types";
import type { ContentSubscriptionAlert } from "~/lib/models/content-subscription-alerts";
import type { Locale } from "~/types";
import { getSavedMapAreaHref } from "~/features/Map/savedArea";

import { FollowAreaButton } from "./FollowAreaButton";

const getTargetTitle = (subscription: ContentSubscription, locale: Locale) => {
  if (subscription.scope === "venue") return subscription.target.name;
  if (subscription.scope === "event")
    return locale === "uk" ? subscription.target.titleUk : subscription.target.titleEn;
  return subscription.target.label;
};

const getTargetHref = (subscription: Exclude<ContentSubscription, { scope: "area" }>) => {
  if (subscription.scope === "venue") return `/venues/${subscription.target.slug}`;
  return `/events/${subscription.target.slug}`;
};

const getTargetIcon = (scope: ContentSubscription["scope"], size = 20) => {
  if (scope === "venue") return <Store aria-hidden size={size} />;
  if (scope === "event") return <CalendarDays aria-hidden size={size} />;
  return <MapPin aria-hidden size={size} />;
};

type FollowingAlertsProps = {
  initialAlerts: ContentSubscriptionAlert[];
  initialSubscriptions: ContentSubscription[];
};

export const FollowingAlerts = ({ initialAlerts, initialSubscriptions }: FollowingAlertsProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { showError, showSuccess } = useNotifications();
  const [subscriptions, setSubscriptions] = useState<ContentSubscription[]>(initialSubscriptions);
  const [alerts, setAlerts] = useState<ContentSubscriptionAlert[]>(initialAlerts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [openSubscriptionId, setOpenSubscriptionId] = useState<string | null>(null);
  const [isMarkingAllAlertsRead, setIsMarkingAllAlertsRead] = useState(false);
  const loadRequestRef = useRef(0);

  const refreshSubscriptions = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    try {
      const response = await fetch("/api/following", { cache: "no-store" });
      const result = (await response.json()) as { error?: string; subscriptions?: ContentSubscription[] };
      if (!response.ok || !result.subscriptions) throw new Error(result.error ?? "Unable to load following");
      if (requestId !== loadRequestRef.current) return;
      setSubscriptions(result.subscriptions);
    } catch (error) {
      if (requestId !== loadRequestRef.current) return;
      const message = error instanceof Error ? error.message : i18n("Unable to load following");
      showError(message);
    }
  }, [i18n, showError]);

  const markAlertRead = async (alertId: string) => {
    try {
      const response = await fetch("/api/following/alerts", {
        body: JSON.stringify({ id: alertId }),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Unable to mark the alert as read");
      setAlerts((current) =>
        current.map((alert) => (alert.id === alertId ? { ...alert, readAt: new Date().toISOString() } : alert)),
      );
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to mark the alert as read"));
    }
  };

  const markAllAlertsRead = async () => {
    if (isMarkingAllAlertsRead) return;
    setIsMarkingAllAlertsRead(true);
    try {
      const response = await fetch("/api/following/alerts", {
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Unable to mark the alerts as read");
      const { marked } = (await response.json()) as { marked?: number };
      setAlerts((current) => current.map((alert) => ({ ...alert, readAt: alert.readAt ?? new Date().toISOString() })));
      showSuccess(marked ? i18n("All alerts marked as read") : i18n("You're all caught up"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to mark the alerts as read"));
    } finally {
      setIsMarkingAllAlertsRead(false);
    }
  };

  const unreadAlertCount = alerts.filter((alert) => !alert.readAt).length;
  const hasUnreadAlerts = unreadAlertCount > 0;
  const subscriptionGroups = [
    {
      items: subscriptions.filter((subscription) => subscription.scope === "area"),
      scope: "area" as const,
      title: i18n("Areas"),
    },
    {
      items: subscriptions.filter((subscription) => subscription.scope === "venue"),
      scope: "venue" as const,
      title: i18n("Venues"),
    },
    {
      items: subscriptions.filter((subscription) => subscription.scope === "event"),
      scope: "event" as const,
      title: i18n("Events"),
    },
  ].filter((group) => group.items.length > 0);

  const recentActivity = (
    <section
      aria-labelledby="recent-activity-heading"
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${hasUnreadAlerts ? "border-primary/20 bg-primary/5" : "bg-surface-tint/35 border-current/10"}`}
    >
      <Sparkles
        aria-hidden
        className={`pointer-events-none absolute -top-5 -right-5 ${hasUnreadAlerts ? "text-primary/10" : "text-neutral/10"}`}
        size={128}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`rounded-xl p-2.5 ${hasUnreadAlerts ? "bg-primary text-surface" : "bg-surface text-primary"}`}
            >
              <Bell aria-hidden size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-primary text-xs font-bold tracking-wide uppercase">
                  {hasUnreadAlerts ? i18n("New activity") : i18n("Recent activity")}
                </p>
                {hasUnreadAlerts && (
                  <span className="bg-primary text-surface rounded-full px-2 py-0.5 text-xs font-bold">
                    {unreadAlertCount}
                  </span>
                )}
              </div>
              <h2 className="mt-0.5 text-xl font-bold" id="recent-activity-heading">
                {hasUnreadAlerts ? i18n("Something new for you") : i18n("Latest from your follows")}
              </h2>
              <p className="text-neutral mt-1 text-sm">
                {hasUnreadAlerts ? i18n("New updates are waiting for you.") : i18n("You're all caught up")}
              </p>
            </div>
          </div>
          {hasUnreadAlerts && (
            <Button
              busy={isMarkingAllAlertsRead}
              color="neutral"
              onClick={() => void markAllAlertsRead()}
              size="sm"
              variant="ghost"
            >
              <Check aria-hidden size={16} /> {i18n("Mark all as read")}
            </Button>
          )}
        </div>
        <div className="mt-5 space-y-2">
          {alerts.slice(0, 5).map((alert) => (
            <Link
              className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 !no-underline transition hover:!no-underline sm:px-4 ${alert.readAt ? "bg-surface/70 hover:bg-surface border-current/10" : "border-primary/20 bg-surface hover:border-primary/40"}`}
              href={alert.href}
              key={alert.id}
              onClick={() => void markAlertRead(alert.id)}
            >
              <div className="bg-primary/10 text-primary shrink-0 rounded-full p-2">
                <Bell aria-hidden size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-neutral text-xs font-medium">
                    {i18n(
                      alert.kind === "EVENT_CHANGED"
                        ? "Event change"
                        : alert.kind === "EVENT_PUBLISHED"
                          ? "New event"
                          : alert.kind === "VENUE_PUBLISHED"
                            ? "New venue"
                            : "Update",
                    )}
                  </span>
                  {!alert.readAt && (
                    <span aria-label={i18n("Unread")} className="bg-primary h-2 w-2 shrink-0 rounded-full" />
                  )}
                </div>
                <p className="mt-0.5 truncate font-semibold">{alert.title}</p>
                {alert.body && <p className="text-neutral mt-0.5 truncate text-sm">{alert.body}</p>}
              </div>
              <ChevronRight
                aria-hidden
                className="text-neutral shrink-0 transition group-hover:translate-x-0.5"
                size={18}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );

  const updatePreferences = async (
    subscription: ContentSubscription,
    preference: keyof ContentSubscriptionPreferences,
    enabled: boolean,
  ) => {
    if (savingId || removingId) return;
    // A list response that began before this mutation must not overwrite its
    // optimistic state (or the confirmed result) when it resolves later.
    loadRequestRef.current += 1;
    const previous = subscription;
    const preferences = { ...subscription, [preference]: enabled };
    setSubscriptions((current) => current.map((item) => (item.id === subscription.id ? preferences : item)));
    setSavingId(subscription.id);

    try {
      const response = await fetch("/api/following", {
        body: JSON.stringify({
          id: subscription.id,
          preferences: {
            eventChangesEnabled: preferences.eventChangesEnabled,
            newEventsEnabled: preferences.newEventsEnabled,
            newVenuesEnabled: preferences.newVenuesEnabled,
            updatesEnabled: preferences.updatesEnabled,
          },
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Unable to update this follow");
      }
      loadRequestRef.current += 1;
    } catch (error) {
      setSubscriptions((current) => current.map((item) => (item.id === subscription.id ? previous : item)));
      showError(error instanceof Error ? error.message : i18n("Unable to update this follow"));
    } finally {
      setSavingId(null);
    }
  };

  const removeSubscription = async (subscription: ContentSubscription) => {
    if (removingId || savingId === subscription.id) return;
    // Keep an earlier refresh from restoring a follow after it has been removed.
    loadRequestRef.current += 1;
    setRemovingId(subscription.id);
    try {
      const response = await fetch("/api/following", {
        body: JSON.stringify({ id: subscription.id }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Unable to remove this follow");
      }
      loadRequestRef.current += 1;
      setSubscriptions((current) => current.filter((item) => item.id !== subscription.id));
      showSuccess(i18n("Stopped following"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to remove this follow"));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <section className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-on-surface text-3xl font-extrabold md:text-5xl">{i18n("Following and alerts")}</h1>
          <p className="text-neutral mt-3 max-w-2xl">
            {i18n("Choose what matters to you and control the alerts in one place.")}
          </p>
          <TextLink className="mt-3" href="/user-profile/settings#content-alert-delivery">
            <Bell aria-hidden size={16} /> {i18n("Manage notification delivery")}
          </TextLink>
        </div>
        <FollowAreaButton
          authenticated
          className="shrink-0"
          onSaved={() => void refreshSubscriptions()}
          presentation="add"
        />
      </section>

      <div className="max-w-6xl">
        {alerts.length > 0 && <div className="mb-10">{recentActivity}</div>}

        <div className="mb-10">
          {subscriptions.length === 0 ? (
            <EmptyState
              body={i18n("Follow a venue or event from its page, or add an area to hear about nearby activity.")}
              className="min-h-72"
              heading={i18n("Nothing followed yet")}
              icon={<Bell aria-hidden className="text-primary" size={44} />}
            />
          ) : (
            <section aria-labelledby="your-follows-heading">
              <div className="mb-4">
                <h2 className="text-xl font-bold" id="your-follows-heading">
                  {i18n("Your follows")}
                </h2>
                <p className="text-neutral mt-1 text-sm">
                  {i18n("Fine-tune the alerts for each place, event, or area.")}
                </p>
              </div>
              <MultipleAccordion>
                {subscriptionGroups.map((group) => (
                  <AccordionItem
                    icon={<span className="text-primary">{getTargetIcon(group.scope)}</span>}
                    key={group.scope}
                    title={`${group.title} (${group.items.length})`}
                  >
                    <div className="divide-y divide-current/10">
                      {group.items.map((subscription) => {
                        const href =
                          subscription.scope === "area"
                            ? getSavedMapAreaHref(subscription.target, "venues")
                            : getTargetHref(subscription);
                        const title = getTargetTitle(subscription, locale);
                        const isOpen = openSubscriptionId === subscription.id;
                        const primaryLabel =
                          subscription.scope === "event"
                            ? "Important event changes"
                            : subscription.scope === "area"
                              ? "Updates from this area"
                              : "Updates from this venue";
                        const secondaryLabel =
                          subscription.scope === "event"
                            ? "Updates on this event"
                            : subscription.scope === "area"
                              ? "New events"
                              : "New events at this venue";

                        return (
                          <article key={subscription.id}>
                            <div className="flex min-w-0 items-start gap-4 px-3 py-3.5 sm:px-4">
                              <div className="min-w-0 flex-1">
                                {href ? (
                                  <Link className="text-primary block truncate font-bold hover:underline" href={href}>
                                    {title}
                                  </Link>
                                ) : (
                                  <h4 className="truncate font-bold">{title}</h4>
                                )}
                                {subscription.scope === "area" && (
                                  <>
                                    <p className="text-neutral mt-0.5 text-sm">
                                      {subscription.target.country} · {subscription.target.radiusMeters / 1000} km
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <Link
                                        className="border-primary/20 bg-surface text-primary hover:bg-primary/5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition"
                                        href={getSavedMapAreaHref(subscription.target, "venues")}
                                      >
                                        {i18n("Venues map")}
                                      </Link>
                                      <Link
                                        className="border-primary/20 bg-surface text-primary hover:bg-primary/5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition"
                                        href={getSavedMapAreaHref(subscription.target, "events")}
                                      >
                                        {i18n("Events map")}
                                      </Link>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="mt-0.5 flex shrink-0 items-center gap-2">
                                <Dropdown
                                  aria-label={i18n("Manage alerts")}
                                  color="neutral"
                                  contentClassName="w-[min(22rem,calc(100vw-2rem))] !p-5"
                                  disabled={savingId === subscription.id || removingId === subscription.id}
                                  label={i18n("Manage alerts")}
                                  onOpenChange={(open) => setOpenSubscriptionId(open ? subscription.id : null)}
                                  open={isOpen}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <fieldset>
                                    <legend className="text-neutral mb-4 text-xs font-semibold tracking-wide uppercase">
                                      {i18n("Alerts")}
                                    </legend>
                                    <div className="space-y-4">
                                      <Checkbox
                                        checked={
                                          subscription.scope === "event"
                                            ? subscription.eventChangesEnabled
                                            : subscription.updatesEnabled
                                        }
                                        disabled={savingId === subscription.id || removingId === subscription.id}
                                        label={i18n(primaryLabel)}
                                        onChange={(event) =>
                                          void updatePreferences(
                                            subscription,
                                            subscription.scope === "event" ? "eventChangesEnabled" : "updatesEnabled",
                                            event.target.checked,
                                          )
                                        }
                                        size="sm"
                                      />
                                      <Checkbox
                                        checked={
                                          subscription.scope === "event"
                                            ? subscription.updatesEnabled
                                            : subscription.newEventsEnabled
                                        }
                                        disabled={savingId === subscription.id || removingId === subscription.id}
                                        label={i18n(secondaryLabel)}
                                        onChange={(event) =>
                                          void updatePreferences(
                                            subscription,
                                            subscription.scope === "event" ? "updatesEnabled" : "newEventsEnabled",
                                            event.target.checked,
                                          )
                                        }
                                        size="sm"
                                      />
                                      {subscription.scope === "area" && (
                                        <Checkbox
                                          checked={subscription.newVenuesEnabled}
                                          disabled={savingId === subscription.id || removingId === subscription.id}
                                          label={i18n("New venues")}
                                          onChange={(event) =>
                                            void updatePreferences(
                                              subscription,
                                              "newVenuesEnabled",
                                              event.target.checked,
                                            )
                                          }
                                          size="sm"
                                        />
                                      )}
                                    </div>
                                  </fieldset>
                                </Dropdown>
                                <ActionButton
                                  aria-label={i18n("Stop following")}
                                  busy={removingId === subscription.id}
                                  color="neutral"
                                  disabled={savingId === subscription.id}
                                  icon={<Trash2 aria-hidden size={18} />}
                                  onClick={() => void removeSubscription(subscription)}
                                  size="md"
                                  variant="ghost"
                                />
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </AccordionItem>
                ))}
              </MultipleAccordion>
            </section>
          )}
        </div>
      </div>
    </>
  );
};
