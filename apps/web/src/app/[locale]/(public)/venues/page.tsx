"use client";

import { LogIn, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { MixpanelTracker } from "~/components/layout";
import { SignInForm } from "~/components/layout/Auth/SignInForm";
import { Breadcrumbs, Button } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { VenuesCatalog } from "~/features/Venues";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";

export default function VenuesPage() {
  const i18n = useI18n();
  const router = useRouter();
  const { data: session } = useUser();
  const { openCustomDialog } = useDialog();

  const isAuthenticated = !!session;

  const handleAddVenue = useCallback(() => {
    sendToMixpanel("Clicked Add Venue", {
      authenticated: isAuthenticated,
      source: "venues_page",
    });

    if (isAuthenticated) {
      router.push("/user-directory/venues");
    } else {
      openCustomDialog({
        children: <SignInForm callbackUrl="/user-directory/venues" />,
      });
    }
  }, [isAuthenticated, router, openCustomDialog]);

  return (
    <div className="container mx-auto">
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/` }]} />
      <div className={`
        mb-12 flex flex-col items-start justify-between gap-4
        sm:flex-row sm:items-center
      `}>
        <h1
          className={`
            bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl
            font-extrabold text-transparent
            md:text-5xl
          `}
        >
          {i18n("Discover venues")}
        </h1>
        <Button className="ml-auto gap-2" color="primary" onClick={handleAddVenue} variant="filled">
          {isAuthenticated ? (
            <>
              <Plus size={20} />
              {i18n("Add new venue")}
            </>
          ) : (
            <>
              <LogIn size={20} />
              {i18n("Sign in to add venue")}
            </>
          )}
        </Button>
      </div>

      <div className="container mx-auto">
        <p className="text-neutral">{i18n("Explore Ukrainian venues and community spaces around the world")}</p>

        <VenuesCatalog />
        <MixpanelTracker event="Viewed Venues Catalog Page" />
      </div>
    </div>
  );
}
