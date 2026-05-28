"use client";

import { LogIn, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { MixpanelTracker } from "~/components/layout";
import { SignInForm } from "~/components/layout/Auth/SignInForm";
import { Breadcrumbs, Button } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { EventsCatalog } from "~/features/Events";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

export default function EventsPage() {
  const i18n = useI18n();
  const router = useRouter();
  const { data: session } = useUser();
  const { openCustomDialog } = useDialog();

  const isAuthenticated = !!session;

  const handleAddEvent = useCallback(() => {
    sendToMixpanel("Clicked Add Event", {
      authenticated: isAuthenticated,
      source: "events_page",
    });

    if (isAuthenticated) {
      router.push("/user-directory/events");
    } else {
      openCustomDialog({
        children: <SignInForm callbackUrl="/user-directory/events" />,
      });
    }
  }, [isAuthenticated, router, openCustomDialog]);

  return (
    <div className="container mx-auto">
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/` }]} />
      <div className={`mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}>
        <h1
          className={`from-primary to-secondary bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl`}
        >
          {i18n("Explore events")}
        </h1>
        <Button
          className="border-on-surface text-on-surface! ml-auto animate-[gradientShift_5s_ease_infinite] gap-2 rounded-2xl! border-2 bg-[linear-gradient(270deg,#f9556d,#9670f7,#4d94f8,#20c997)] bg-size-[300%_300%] p-5 font-bold shadow-xl"
          color="primary"
          onClick={handleAddEvent}
          variant="filled"
        >
          {isAuthenticated ? (
            <>
              <Plus size={20} strokeWidth={4} />
              {i18n("Add event")}
            </>
          ) : (
            <>
              <LogIn size={20} strokeWidth={4} />
              {i18n("Sign in to add event")}
            </>
          )}
        </Button>
      </div>

      <div className="container mx-auto">
        <p className="text-neutral">{i18n("Explore Ukrainian events and gatherings around the world")}</p>

        <EventsCatalog />
        <MixpanelTracker event="Viewed Events Catalog Page" />
      </div>
    </div>
  );
}
