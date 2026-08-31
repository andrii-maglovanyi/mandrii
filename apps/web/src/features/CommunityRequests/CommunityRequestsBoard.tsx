"use client";

import {
  ArrowLeft,
  CalendarClock,
  EyeOff,
  HandHeart,
  Handshake,
  Link2,
  MapPin,
  Pencil,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar } from "~/components/layout";
import { SignInForm } from "~/components/layout/Auth/SignInForm";
import {
  ActionButton,
  Badge,
  Breadcrumbs,
  Button,
  EmptyState,
  Input,
  LocationAutocomplete,
  Modal,
  Select,
  Textarea,
  TextLink,
} from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { useRouter } from "~/i18n/navigation";
import { CommunityRelatedContentPicker } from "~/features/CommunityRequests/CommunityRelatedContentPicker";
import { UserProfilePreview } from "~/features/UserProfile/UserProfilePreview";
import { AddEntityButton } from "~/features/shared/AddEntityButton";
import {
  COMMUNITY_REQUEST_CATEGORIES,
  CommunityRequest,
  CommunityRequestCategory,
  CommunityRequestKind,
  CommunityRequestResponse,
  CommunityResponseThread,
  CommunityRelatedContent,
  CommunityRequestsPage,
} from "~/lib/community-requests/types";
import { sendToMixpanel } from "~/lib/mixpanel";

const categoryLabels: Record<CommunityRequestCategory, string> = {
  COMMUNITY_AND_VOLUNTEERING: "Community & volunteering",
  FAMILY_AND_CHILDREN: "Family & children",
  HOUSING_AND_ITEMS: "Housing & items",
  LANGUAGE_AND_TRANSLATION: "Language & translation",
  PRACTICAL_SUPPORT: "Practical support",
  WORK_AND_SKILLS: "Work & skills",
};

type FormState = {
  body: string;
  category: CommunityRequestCategory;
  country: string;
  expiresInDays: number;
  kind: CommunityRequestKind;
  location: string;
  relatedContent: CommunityRelatedContent | null;
  title: string;
};

const initialForm: FormState = {
  body: "",
  category: "PRACTICAL_SUPPORT",
  country: "",
  expiresInDays: 14,
  kind: "REQUEST",
  location: "",
  relatedContent: null,
  title: "",
};

const formatRelativeDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(date));

export function CommunityRequestsBoard({
  initialFilters,
  initialPage,
  initialViewerUserId,
}: {
  initialFilters: {
    category?: CommunityRequestCategory;
    country?: string;
    kind?: CommunityRequestKind;
    location?: string;
    query?: string;
  };
  initialPage: CommunityRequestsPage;
  initialViewerUserId?: string;
}) {
  const i18n = useI18n();
  const router = useRouter();
  const { data: user, isAuthenticated, isLoading: isUserLoading } = useUser();
  const viewerUserId = user?.id ?? (isUserLoading ? initialViewerUserId : undefined);
  const viewerIsAuthenticated = isAuthenticated || (isUserLoading && Boolean(initialViewerUserId));
  const { openCustomDialog } = useDialog();
  const { showError, showSuccess } = useNotifications();
  const [requests, setRequests] = useState(initialPage.requests);
  const [total, setTotal] = useState(initialPage.total);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [kind, setKind] = useState<"ALL" | CommunityRequestKind>(initialFilters.kind ?? "ALL");
  const [category, setCategory] = useState<"ALL" | CommunityRequestCategory>(initialFilters.category ?? "ALL");
  const [locationFilter, setLocationFilter] = useState(initialFilters.query ?? initialFilters.location ?? "");
  const [searchQuery, setSearchQuery] = useState(initialFilters.query ?? "");
  const skipNextSearchNavigation = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<null | string>(null);
  const [isReplyingTo, setIsReplyingTo] = useState<null | string>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [responsesDialogRequest, setResponsesDialogRequest] = useState<CommunityRequest | null>(null);
  const [responses, setResponses] = useState<CommunityRequestResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [thread, setThread] = useState<CommunityResponseThread | null>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [threadDraft, setThreadDraft] = useState("");
  const [isSendingThreadMessage, setIsSendingThreadMessage] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const visibleRequests = useMemo(
    () =>
      requests.filter(
        (request) => (kind === "ALL" || request.kind === kind) && (category === "ALL" || request.category === category),
      ),
    [category, kind, requests],
  );
  const hasExactLocationMatches = useMemo(
    () =>
      Boolean(initialFilters.location) &&
      visibleRequests.some(
        (request) => request.location?.toLocaleLowerCase() === initialFilters.location?.toLocaleLowerCase(),
      ),
    [initialFilters.location, visibleRequests],
  );

  useEffect(() => {
    setRequests(initialPage.requests);
    setTotal(initialPage.total);
    setNextCursor(initialPage.nextCursor);
    setLocationFilter(initialFilters.query ?? initialFilters.location ?? "");
    setSearchQuery(initialFilters.query ?? "");
    setKind(initialFilters.kind ?? "ALL");
    setCategory(initialFilters.category ?? "ALL");
  }, [initialFilters, initialPage]);

  useEffect(() => {
    if (skipNextSearchNavigation.current) {
      skipNextSearchNavigation.current = false;
      return;
    }
    if (searchQuery.trim() === (initialFilters.query ?? "")) return;

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      router.replace(`/community${params.size ? `?${params.toString()}` : ""}`);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [initialFilters.query, router, searchQuery]);

  const applyLocationFilter = ({ country, location }: { country?: string; location: string }) => {
    if (!country) {
      showError(i18n("Choose a location from the suggestions."));
      return;
    }
    skipNextSearchNavigation.current = true;
    setSearchQuery("");
    setLocationFilter(location);
    const params = new URLSearchParams({ country, location });
    router.push(`/community?${params.toString()}`);
  };

  const clearLocationFilter = () => {
    setLocationFilter("");
    setSearchQuery("");
    skipNextSearchNavigation.current = true;
    router.push("/community");
  };

  const changeServerFilter = (next: {
    category?: "ALL" | CommunityRequestCategory;
    kind?: "ALL" | CommunityRequestKind;
  }) => {
    const nextKind = next.kind ?? kind;
    const nextCategory = next.category ?? category;
    setKind(nextKind);
    setCategory(nextCategory);
    const params = new URLSearchParams();
    if (initialFilters.country) params.set("country", initialFilters.country);
    if (initialFilters.location) params.set("location", initialFilters.location);
    if (initialFilters.query) params.set("q", initialFilters.query);
    if (nextKind !== "ALL") params.set("kind", nextKind);
    if (nextCategory !== "ALL") params.set("category", nextCategory);
    router.replace(`/community${params.size ? `?${params.toString()}` : ""}`);
  };

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({ cursor: nextCursor });
      if (initialFilters.country) params.set("country", initialFilters.country);
      if (initialFilters.location) params.set("location", initialFilters.location);
      if (initialFilters.query) params.set("q", initialFilters.query);
      if (kind !== "ALL") params.set("kind", kind);
      if (category !== "ALL") params.set("category", category);
      const response = await fetch(`/api/community-requests?${params.toString()}`);
      const result = (await response.json()) as CommunityRequestsPage | { error?: string };
      if (!response.ok || !("requests" in result)) throw new Error("Unable to load more posts");
      setRequests((current) => [...current, ...result.requests]);
      setNextCursor(result.nextCursor);
      setTotal(result.total);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to load more posts"));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const openComposer = () => {
    sendToMixpanel("Clicked Create Community Request", { authenticated: viewerIsAuthenticated });
    if (!viewerIsAuthenticated) {
      openCustomDialog({ children: <SignInForm callbackUrl="/community" /> });
      return;
    }
    setIsOpen(true);
  };

  const openEditor = (request: CommunityRequest) => {
    setEditingId(request.id);
    setForm({
      body: request.body,
      category: request.category,
      country: request.country,
      expiresInDays: Math.max(
        1,
        Math.min(365, Math.ceil((new Date(request.expiresAt).getTime() - Date.now()) / 86_400_000)),
      ),
      kind: request.kind,
      location: request.location ?? "",
      relatedContent: request.relatedContent,
      title: request.title,
    });
    setIsOpen(true);
  };

  const openUserProfilePreview = (userId: string, name: null | string) => {
    void openCustomDialog({
      children: <UserProfilePreview fallbackName={name ?? i18n("Someone")} userId={userId} />,
      title: i18n("Profile"),
    });
  };

  const closeComposer = () => {
    if (isSubmitting) return;
    setEditingId(null);
    setForm(initialForm);
    setIsOpen(false);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      form.title.trim().length < 5 ||
      form.body.trim().length < 5 ||
      !form.country ||
      form.location.trim().length < 2
    ) {
      showError(i18n("Add a title, a few details and choose a location before publishing."));
      return;
    }
    setIsSubmitting(true);
    try {
      const { relatedContent, ...formData } = form;
      const response = await fetch(editingId ? `/api/community-requests/${editingId}` : "/api/community-requests", {
        body: JSON.stringify({
          ...formData,
          location: form.location.trim() || null,
          relatedEventId: relatedContent?.type === "EVENT" ? relatedContent.id : null,
          relatedVenueId: relatedContent?.type === "VENUE" ? relatedContent.id : null,
        }),
        headers: { "Content-Type": "application/json" },
        method: editingId ? "PATCH" : "POST",
      });
      const result = (await response.json().catch(() => null)) as CommunityRequest | { error?: string } | null;
      if (!response.ok || !result || !("id" in result)) {
        throw new Error(result && "error" in result ? result.error : "Unable to publish your post");
      }
      setRequests((current) =>
        editingId ? current.map((request) => (request.id === result.id ? result : request)) : [result, ...current],
      );
      setForm(initialForm);
      setEditingId(null);
      setIsOpen(false);
      showSuccess(i18n(editingId ? "Post updated" : "Your post is live"));
      sendToMixpanel(editingId ? "Updated Community Request" : "Published Community Request", {
        category: result.category,
        kind: result.kind,
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to publish your post"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const close = async (request: CommunityRequest) => {
    try {
      const response = await fetch(`/api/community-requests/${request.id}/close`, { method: "POST" });
      if (!response.ok) throw new Error("Unable to close this post");
      setRequests((current) => current.filter((item) => item.id !== request.id));
      showSuccess(i18n("Post closed"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to close this post"));
    }
  };

  const submitResponse = async (event: React.FormEvent<HTMLFormElement>, request: CommunityRequest) => {
    event.preventDefault();
    const body = replyDrafts[request.id]?.trim() ?? "";
    if (!body) return;
    if (!viewerIsAuthenticated) {
      openCustomDialog({ children: <SignInForm callbackUrl="/community" /> });
      return;
    }
    setIsReplyingTo(request.id);
    try {
      const response = await fetch(`/api/community-requests/${request.id}/responses`, {
        body: JSON.stringify({ body }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as CommunityRequestResponse | { error?: string } | null;
      if (!response.ok || !result || !("id" in result)) {
        throw new Error(result && "error" in result ? result.error : "Unable to publish your response");
      }
      setReplyDrafts((current) => ({ ...current, [request.id]: "" }));
      setRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? { ...item, responseCount: item.responseCount + 1, viewerResponseId: result.id }
            : item,
        ),
      );
      showSuccess(i18n("Private response sent"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to publish your response"));
    } finally {
      setIsReplyingTo(null);
    }
  };

  const openResponses = async (request: CommunityRequest) => {
    setResponsesDialogRequest(request);
    setResponses([]);
    setIsLoadingResponses(true);
    try {
      const response = await fetch(`/api/community-requests/${request.id}/responses`);
      const result = (await response.json().catch(() => null)) as
        | CommunityRequestResponse[]
        | { error?: string }
        | null;
      if (!response.ok || !Array.isArray(result)) {
        throw new Error(
          result && !Array.isArray(result) && "error" in result ? result.error : "Unable to load responses",
        );
      }
      setResponses(result);
    } catch (error) {
      setResponsesDialogRequest(null);
      showError(error instanceof Error ? error.message : i18n("Unable to load responses"));
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const openThread = async (responseId: string) => {
    setThread(null);
    setThreadDraft("");
    setIsLoadingThread(true);
    try {
      const response = await fetch(`/api/community-responses/${responseId}`);
      const result = (await response.json().catch(() => null)) as CommunityResponseThread | { error?: string } | null;
      if (!response.ok || !result || !("response" in result)) {
        throw new Error(result && "error" in result ? result.error : "Unable to load conversation");
      }
      setThread(result);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to load conversation"));
    } finally {
      setIsLoadingThread(false);
    }
  };

  const submitThreadMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = threadDraft.trim();
    if (!thread || !body) return;
    setIsSendingThreadMessage(true);
    try {
      const response = await fetch(`/api/community-responses/${thread.response.id}`, {
        body: JSON.stringify({ body }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as
        | CommunityResponseThread["messages"][number]
        | { error?: string }
        | null;
      if (!response.ok || !result || !("id" in result)) {
        throw new Error(result && "error" in result ? result.error : "Unable to send message");
      }
      setThread((current) => (current ? { ...current, messages: [...current.messages, result] } : current));
      setThreadDraft("");
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to send message"));
    } finally {
      setIsSendingThreadMessage(false);
    }
  };

  return (
    <section className="flex flex-1 flex-col pb-16">
      <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }]} />
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl">
          {i18n("Community help")}
        </h1>
        <AddEntityButton
          className="ml-auto"
          isAuthenticated={viewerIsAuthenticated}
          label={i18n("Post a request or offer")}
          onClick={openComposer}
          signInLabel={i18n("Sign in to post")}
        />
      </div>

      <p className="text-neutral mb-6">{i18n("Ask for help - or offer it.")}</p>

      <div className="mb-3 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(11rem,0.7fr)_minmax(13rem,0.8fr)]">
        <LocationAutocomplete
          onChange={(event) => {
            setLocationFilter(event.target.value);
            setSearchQuery(event.target.value);
          }}
          onPlaceDetailsSelect={applyLocationFilter}
          placeholder={i18n("Search posts or location")}
          value={locationFilter}
        />
        <Select
          aria-label={i18n("Filter by post type")}
          onChange={(event) => changeServerFilter({ kind: event.target.value as "ALL" | CommunityRequestKind })}
          options={[
            { label: i18n("All posts"), value: "ALL" },
            { label: i18n("I need help"), value: "REQUEST" },
            { label: i18n("I can help"), value: "OFFER" },
          ]}
          value={kind}
        />
        <Select
          aria-label={i18n("Filter by category")}
          onChange={(event) => changeServerFilter({ category: event.target.value as "ALL" | CommunityRequestCategory })}
          options={[
            { label: i18n("All categories"), value: "ALL" },
            ...COMMUNITY_REQUEST_CATEGORIES.map((value) => ({ label: i18n(categoryLabels[value]), value })),
          ]}
          value={category}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-on-surface text-sm font-medium">
          {i18n("Showing {count} of {total} posts", { count: visibleRequests.length, total })}
        </p>
        {initialFilters.country && (
          <>
            {initialFilters.location && !hasExactLocationMatches && visibleRequests.length > 0 && (
              <span className="text-neutral text-sm">
                {i18n("No matching posts in {location} - showing all in {country}.", initialFilters)}
              </span>
            )}
            <Button className="gap-1" color="neutral" onClick={clearLocationFilter} size="sm" variant="ghost">
              <RotateCcw aria-hidden size={15} /> {i18n("Clear location")}
            </Button>
          </>
        )}
      </div>

      {visibleRequests.length ? (
        <>
          <div className="mt-4 columns-1 gap-4 md:columns-2">
            {visibleRequests.map((request) => {
              const isOwner = viewerUserId === request.author.id;
              return (
                <article
                  className="border-neutral/20 bg-surface-tint/35 group mb-4 flex break-inside-avoid flex-col rounded-2xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                  key={request.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        icon={request.kind === "REQUEST" ? <HandHeart size={14} /> : <Handshake size={14} />}
                        size="md"
                        variant={request.kind === "REQUEST" ? "info" : "success"}
                      >
                        {request.kind === "REQUEST" ? i18n("Needs help") : i18n("Can help")}
                      </Badge>
                      <Badge variant="neutral">{i18n(categoryLabels[request.category])}</Badge>
                    </div>
                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <ActionButton
                          aria-label={i18n("Edit post")}
                          color="neutral"
                          icon={<Pencil size={16} />}
                          onClick={() => openEditor(request)}
                          size="md"
                          variant="ghost"
                        />
                        <ActionButton
                          aria-label={i18n("Close post")}
                          color="neutral"
                          icon={<X size={16} />}
                          onClick={() => close(request)}
                          size="md"
                          variant="ghost"
                        />
                      </div>
                    )}
                  </div>
                  <h2 className="text-on-surface mt-4 text-xl font-bold tracking-tight">{request.title}</h2>
                  <p className="text-neutral mt-2 leading-relaxed whitespace-pre-line">{request.body}</p>
                  {request.relatedContent && (
                    <TextLink
                      className="mt-4 inline-flex items-center gap-1.5 text-sm"
                      href={`/${request.relatedContent.type === "VENUE" ? "venues" : "events"}/${request.relatedContent.slug}`}
                    >
                      <Link2 aria-hidden size={15} />
                      {i18n("Related {type}: {name}", {
                        name: request.relatedContent.name,
                        type: i18n(request.relatedContent.type === "VENUE" ? "Venue" : "Event"),
                      })}
                    </TextLink>
                  )}
                  <div className="text-neutral mt-5 flex flex-col gap-3 text-sm">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden size={15} />
                        {[request.location, request.country].filter(Boolean).join(", ")}
                      </span>
                      <span aria-hidden className="text-neutral/70">
                        •
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock aria-hidden size={15} />
                        {i18n("Open until")} {formatRelativeDate(request.expiresAt, "en")}
                      </span>
                    </div>
                    <button
                      className="text-primary hover:text-primary-hover inline-flex items-center gap-2 font-medium"
                      onClick={() => openUserProfilePreview(request.author.id, request.author.name)}
                      type="button"
                    >
                      <Avatar avatarSize={24} profile={request.author} />
                      <span>{request.author.name ?? i18n("Someone")}</span>
                    </button>
                  </div>
                  {(isOwner ? request.responseCount > 0 : true) && (
                    <div
                      className={isOwner || request.viewerResponseId ? "mt-auto flex justify-end pt-5" : "mt-auto pt-5"}
                    >
                      {isOwner ? (
                        <Button
                          color="primary"
                          onClick={() => void openResponses(request)}
                          size="sm"
                          variant="outlined"
                        >
                          {i18n("View private responses ({count})", { count: request.responseCount })}
                        </Button>
                      ) : request.viewerResponseId ? (
                        <Button
                          color="primary"
                          onClick={() => void openThread(request.viewerResponseId!)}
                          size="sm"
                          variant="outlined"
                        >
                          {i18n("View your response")}
                        </Button>
                      ) : (
                        <form className="flex flex-col gap-2" onSubmit={(event) => submitResponse(event, request)}>
                          <Textarea
                            aria-label={i18n("Respond to this post")}
                            maxChars={800}
                            onChange={(event) =>
                              setReplyDrafts((current) => ({ ...current, [request.id]: event.target.value }))
                            }
                            placeholder={i18n("Write a helpful reply - only the post author can see it")}
                            rows={2}
                            value={replyDrafts[request.id] ?? ""}
                          />
                          <Button
                            busy={isReplyingTo === request.id}
                            className="self-start"
                            color="primary"
                            size="sm"
                            type="submit"
                            variant="outlined"
                          >
                            {i18n("Respond privately")}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {nextCursor && (
            <div className="mt-2 flex justify-center">
              <Button busy={isLoadingMore} color="primary" onClick={() => void loadMore()} variant="outlined">
                {i18n("Load more posts")}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            body={
              initialFilters.country
                ? i18n("No posts in {country} yet. Try another place or create the first post.", initialFilters)
                : i18n("Try changing your filters or create the first post.")
            }
            className="my-0 translate-y-8 md:translate-y-10"
            heading={i18n("No posts found")}
            icon={<EyeOff aria-hidden size={64} />}
          />
        </div>
      )}

      <Modal
        className="mb-0"
        isOpen={isOpen}
        onClose={closeComposer}
        scrollable
        title={i18n(editingId ? "Edit post" : "Post to the community")}
      >
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <p className="text-neutral text-sm">
            {i18n("Keep personal contact details private. Agree a safe way to connect after someone responds.")}
          </p>
          <Select
            label={i18n("What are you posting?")}
            onChange={(event) =>
              setForm((current) => ({ ...current, kind: event.target.value as CommunityRequestKind }))
            }
            options={[
              { label: i18n("I need help"), value: "REQUEST" },
              { label: i18n("I can help"), value: "OFFER" },
            ]}
            value={form.kind}
          />
          <Select
            label={i18n("Category")}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value as CommunityRequestCategory }))
            }
            options={COMMUNITY_REQUEST_CATEGORIES.map((value) => ({ label: i18n(categoryLabels[value]), value }))}
            value={form.category}
          />
          <Input
            label={i18n("Title")}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
            value={form.title}
          />
          <Textarea
            label={i18n("Details")}
            maxChars={1500}
            onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
            required
            rows={5}
            value={form.body}
          />
          <LocationAutocomplete
            label={i18n("Location")}
            onChange={(event) => setForm((current) => ({ ...current, country: "", location: event.target.value }))}
            onPlaceDetailsSelect={({ country, location }) =>
              setForm((current) => ({ ...current, country: country ?? "", location }))
            }
            placeholder={i18n("Search for a city, district or address")}
            required
            value={form.location}
          />
          <CommunityRelatedContentPicker
            onChange={(relatedContent) => setForm((current) => ({ ...current, relatedContent }))}
            value={form.relatedContent}
          />
          <Select
            label={i18n("Close this post after")}
            onChange={(event) => setForm((current) => ({ ...current, expiresInDays: Number(event.target.value) }))}
            options={[
              { label: i18n("1 day"), value: 1 },
              { label: i18n("7 days"), value: 7 },
              { label: i18n("14 days"), value: 14 },
              { label: i18n("30 days"), value: 30 },
              { label: i18n("90 days"), value: 90 },
              { label: i18n("1 year"), value: 365 },
            ]}
            value={form.expiresInDays}
          />
          <Button busy={isSubmitting} color="primary" type="submit">
            {i18n(editingId ? "Save changes" : "Publish post")}
          </Button>
        </form>
      </Modal>

      <Modal
        className="mb-0 flex min-h-0 flex-col"
        height="conversation"
        isOpen={Boolean(responsesDialogRequest) || Boolean(thread) || isLoadingThread}
        onClose={() => {
          if (isSendingThreadMessage) return;
          setThread(null);
          setIsLoadingThread(false);
          setResponsesDialogRequest(null);
        }}
        title={i18n("Private responses")}
      >
        {isLoadingThread ? (
          <p className="text-neutral text-sm">{i18n("Loading responses...")}</p>
        ) : thread ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div>
              <p className="text-on-surface font-semibold">{thread.requestTitle}</p>
              <p className="text-neutral mt-1 text-sm">
                {i18n("This conversation is private between you and the person who responded.")}
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              <div className="bg-surface-tint/35 rounded-xl p-3 text-sm">
                <p className="text-primary font-medium">{thread.response.author.name ?? i18n("Someone")}</p>
                <p className="text-on-surface mt-1 whitespace-pre-line">{thread.response.body}</p>
              </div>
              {thread.messages.map((message) => {
                const sentByViewer = message.senderUserId === viewerUserId;
                return (
                  <div className={`flex ${sentByViewer ? "justify-end" : "justify-start"}`} key={message.id}>
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-sm ${
                        sentByViewer ? "bg-primary text-surface" : "bg-surface-tint/35 text-on-surface"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.body}</p>
                      {message.source === "TELEGRAM" && (
                        <p className={`mt-2 text-xs ${sentByViewer ? "text-surface/75" : "text-neutral"}`}>
                          {i18n("Sent from Telegram")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <form className="flex flex-col gap-2" onSubmit={submitThreadMessage}>
              <Textarea
                aria-label={i18n("Write a private reply")}
                maxChars={1500}
                onChange={(event) => setThreadDraft(event.target.value)}
                placeholder={i18n("Write a private reply")}
                rows={3}
                value={threadDraft}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                {responsesDialogRequest ? (
                  <Button
                    color="neutral"
                    onClick={() => {
                      setThread(null);
                      setThreadDraft("");
                    }}
                    type="button"
                    variant="ghost"
                  >
                    <ArrowLeft aria-hidden size={16} /> {i18n("Back to responses")}
                  </Button>
                ) : (
                  <span />
                )}
                <Button busy={isSendingThreadMessage} color="primary" type="submit">
                  {i18n("Send")}
                </Button>
              </div>
            </form>
          </div>
        ) : isLoadingResponses ? (
          <p className="text-neutral text-sm">{i18n("Loading responses...")}</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <p className="text-neutral mb-4 text-sm">{i18n("Only you can see these messages.")}</p>
            {responses.length ? (
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {responses.map((response) => (
                  <div className="bg-surface-tint/35 flex items-start gap-3 rounded-xl p-3" key={response.id}>
                    <button
                      aria-label={i18n("View profile for {name}", {
                        name: response.author.name ?? i18n("Someone"),
                      })}
                      className="shrink-0 self-start"
                      onClick={() => openUserProfilePreview(response.author.id, response.author.name)}
                      type="button"
                    >
                      <Avatar avatarSize={32} profile={response.author} />
                    </button>
                    <div className="w-full min-w-0 text-sm">
                      <button
                        className="text-primary hover:text-primary-hover font-medium underline underline-offset-2"
                        onClick={() => openUserProfilePreview(response.author.id, response.author.name)}
                        type="button"
                      >
                        {response.author.name ?? i18n("Someone")}
                      </button>
                      <p className="text-on-surface mt-1 leading-relaxed whitespace-pre-line">{response.body}</p>
                      <div className="mt-3 flex justify-end">
                        <Button color="primary" onClick={() => void openThread(response.id)} size="sm" variant="ghost">
                          {i18n("Open conversation")}
                          {response.messageCount > 0 ? ` (${response.messageCount})` : ""}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral text-sm">{i18n("No responses yet")}</p>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
