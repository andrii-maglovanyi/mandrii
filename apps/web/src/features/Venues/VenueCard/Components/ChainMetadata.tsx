"use client";

import clsx from "clsx";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getFlagComponent } from "~/lib/icons/flags";
import { getIcon } from "~/lib/icons/icons";
import { GetPublicVenuesQuery } from "~/types";

interface ChainMetadataProps {
  venue: GetPublicVenuesQuery["venues"][number];
}

interface TreeNodeProps {
  children?: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  icon: ReactNode;
  label: ReactNode;
  metadata?: ReactNode;
}

const TreeNode = ({ children, className, defaultOpen = false, icon, label, metadata }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasChildren = Boolean(children);

  return (
    <div className={className}>
      <div
        className="flex cursor-pointer items-center gap-2 rounded py-1"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : <span className={`w-4`} />}
        <div className="group/chain flex items-center">
          <div className="shrink-0 pr-3">{icon}</div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="text-neutral">{label}</div>
            {metadata && <div className="text-neutral text-xs">{metadata}</div>}
          </div>
        </div>
      </div>
      {isOpen && hasChildren && <div className="ml-2">{children}</div>}
    </div>
  );
};

export const ChainMetadata = ({ venue }: ChainMetadataProps) => {
  const i18n = useI18n();

  if (!venue.chain) {
    return null;
  }

  const chain = venue.chain;
  const parentChain = chain.chain;
  const venues = chain.venues || [];
  const chainsInParent = parentChain?.chains || [];
  const { iconName } = constants.categories[venue.category as keyof typeof constants.categories];

  return (
    <div className="mt-2 mb-2 text-sm">
      <div className="flex flex-col">
        {parentChain ? (
          <TreeNode
            defaultOpen
            icon={getIcon(iconName, { className: "text-primary", size: 18 })}
            label={<span className="text-on-surface">{parentChain.name}</span>}
            metadata={i18n("{number} countries", { number: chainsInParent.length })}
          >
            {chainsInParent.map(({ country, id, name, venues, venues_aggregate }) => {
              const venueCount = venues_aggregate?.aggregate?.count || venues.length;

              const countryCode = Object.entries(constants.whitelisted_countries).find(
                ([, { label }]) => country === label.en,
              )?.[0];

              const CountryFlag = getFlagComponent(countryCode);

              return (
                <TreeNode
                  className="ml-5.5"
                  defaultOpen={id === chain.id}
                  icon={
                    CountryFlag ? (
                      <CountryFlag
                        className={clsx(
                          "h-4 w-5 rounded-sm",
                          id !== chain.id && `opacity-60 group-hover/chain:opacity-100`,
                        )}
                      />
                    ) : (
                      <MapPin className="text-neutral" size={18} />
                    )
                  }
                  key={id}
                  label={id === chain.id ? <span className="text-on-surface">{name}</span> : name}
                  metadata={i18n("{number} venues", { number: venueCount })}
                >
                  {venues.map((v) => {
                    return (
                      <TreeNode
                        className="ml-5.5"
                        icon={
                          <MapPin
                            className={clsx(
                              v.id === venue.id ? "text-on-surface" : `text-neutral/60 group-hover/chain:text-neutral`,
                            )}
                            size={18}
                          />
                        }
                        key={v.id}
                        label={
                          v.id === venue.id ? (
                            <span className="text-on-surface">{v.name}</span>
                          ) : (
                            <Link href={`/venues/${v.slug}`}>{v.name}</Link>
                          )
                        }
                        metadata={v.city}
                      />
                    );
                  })}
                </TreeNode>
              );
            })}
          </TreeNode>
        ) : (
          <TreeNode
            defaultOpen
            icon={getIcon(iconName, { className: "text-primary", size: 18 })}
            label={chain.name}
            metadata={i18n("{number} venues", { number: venues.length })}
          >
            {venues.map(({ city, id, name, slug }) => {
              return (
                <TreeNode
                  className="ml-5.5"
                  icon={
                    <MapPin
                      className={clsx(
                        id === venue.id ? "text-on-surface" : `text-neutral/50 group-hover/chain:text-neutral`,
                      )}
                      size={18}
                    />
                  }
                  key={id}
                  label={
                    id === venue.id ? (
                      <span className="text-on-surface">{name}</span>
                    ) : (
                      <Link href={`/venues/${slug}`}>{name}</Link>
                    )
                  }
                  metadata={city}
                />
              );
            })}
          </TreeNode>
        )}
      </div>
    </div>
  );
};
