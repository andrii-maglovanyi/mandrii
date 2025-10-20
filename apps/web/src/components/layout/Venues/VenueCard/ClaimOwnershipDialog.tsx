import { Calendar, ChartColumnIncreasing, LogIn, MapPin, PenTool, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { Alert, Button } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { GetPublicVenuesQuery } from "~/types";

import { SignInForm } from "../../Auth/SignInForm";

interface ClaimOwnershipDialogProps {
  venue: GetPublicVenuesQuery["venues"][number];
}

export const ClaimOwnershipDialog = ({ venue }: ClaimOwnershipDialogProps) => {
  const { data: session } = useUser();
  const router = useRouter();
  const i18n = useI18n();
  const { openCustomDialog } = useDialog();

  const OWNERSHIP_BENEFITS = [
    {
      icon: PenTool,
      text: i18n("Update and manage venue information"),
    },
    {
      icon: Calendar,
      text: i18n("Host and promote events"),
    },
    {
      icon: Users,
      text: i18n("Connect with local community"),
    },
    {
      icon: ChartColumnIncreasing,
      text: i18n("View analytics and more"),
    },
  ] as const;

  const isAuthenticated = !!session?.user;

  const handleSignIn = useCallback(() => {
    sendToMixpanel("Clicked Sign In", {
      source: "claim_ownership_dialog",
      venue_id: venue.id,
    });

    openCustomDialog({
      children: <SignInForm />,
    });
  }, [openCustomDialog, venue.id]);

  const handleClaimOwnership = useCallback(() => {
    sendToMixpanel("Clicked Claim Ownership", {
      venue_id: venue.id,
      venue_name: venue.name,
    });

    router.push(`/claim-ownership?venue=${venue.id}`);
  }, [router, venue.id, venue.name]);

  useEffect(() => {
    sendToMixpanel("Viewed Claim Ownership Dialog", {
      is_authenticated: isAuthenticated,
      venue_id: venue.id,
    });
  }, [venue.id, isAuthenticated]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center justify-center">
          <MapPin className="text-primary" size={32} />
        </div>

        <h1 className="text-xl font-semibold">{i18n("Claim your ownership")}</h1>

        <div className="my-6 flex flex-col items-center space-y-1">
          <p
            className={`from-primary to-secondary w-fit bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent`}
          >
            {venue.name}
          </p>
          <p className="text-neutral">{venue.address}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-center text-xl font-semibold">{i18n("What you'll get:")}</h3>

        <ul className="space-y-2">
          {OWNERSHIP_BENEFITS.map(({ icon: Icon, text }) => (
            <li className="flex items-start gap-2 p-1" key={text}>
              <Icon size={20} />

              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col space-y-4 pt-2">
        {isAuthenticated ? (
          <Button color="primary" onClick={handleClaimOwnership} variant="filled">
            {i18n("Claim your ownership")}
          </Button>
        ) : (
          <div className="flex flex-col space-y-4">
            <Alert variant="warning">{i18n("Sign in to claim ownership of this venue")}</Alert>

            <Button className="gap-2 py-3" color="primary" onClick={handleSignIn} variant="outlined">
              <LogIn size={20} />
              {i18n("Sign in")}
            </Button>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-neutral text-center text-sm leading-relaxed">
        {i18n("I will verify your ownership before granting access to enhanced features")}
      </p>
    </div>
  );
};
