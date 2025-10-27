"use client";

import { useState } from "react";

import { ContactForm } from "~/components/layout";
import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

interface ClaimOwnershipProps {
  name: string;
  slug: string;
}

export const ClaimOwnership = ({ name, slug }: ClaimOwnershipProps) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const i18n = useI18n();

  const template = i18n("I manage {name} ({slug}) and would like to claim ownership of its venue.", { name, slug });

  return (
    <div className="w-full px-12 text-center">
      {isClaiming ? (
        <div className="text-left">
          <ContactForm template={template} />
        </div>
      ) : (
        <Button
          className={`
            mndr-with-gradient-shadow mx-auto w-full max-w-3xs
            md:w-auto
          `}
          color="primary"
          isFeatured
          onClick={() => {
            setIsClaiming(true);
          }}
          size="lg"
        >
          {i18n("Start verification")}
        </Button>
      )}
    </div>
  );
};
