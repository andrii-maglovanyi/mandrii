import { Map } from "lucide-react";
import type { ReactNode } from "react";

import { Breadcrumbs, TextLink } from "~/components/ui";

type CatalogPageHeaderProps = {
  addAction: ReactNode;
  description: string;
  followAction: ReactNode;
  homeLabel: string;
  mapHref: string;
  mapLabel: string;
  title: string;
};

/** A responsive, consistent page header shared by the public catalogues. */
export function CatalogPageHeader({
  addAction,
  description,
  followAction,
  homeLabel,
  mapHref,
  mapLabel,
  title,
}: Readonly<CatalogPageHeaderProps>) {
  return (
    <>
      <Breadcrumbs items={[{ title: homeLabel, url: "/" }]} />
      <header className="mb-8 flex flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div className="max-w-2xl">
          <h1 className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl">
            {title}
          </h1>
          <p className="text-neutral mt-3 max-w-2xl">{description}</p>
          <TextLink className="mt-4 lg:hidden" href={mapHref}>
            <Map aria-hidden size={17} /> {mapLabel}
          </TextLink>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:flex-nowrap lg:items-center lg:justify-end 2xl:shrink-0">
          <div className="order-3 hidden min-h-12 items-center lg:flex">
            <TextLink className="min-h-12 whitespace-nowrap" href={mapHref}>
              <Map aria-hidden size={18} /> {mapLabel}
            </TextLink>
          </div>
          <div className="order-2 w-full [&>button]:w-full lg:order-4 lg:w-auto lg:[&>button]:w-auto">{followAction}</div>
          <div className="order-1 w-full [&>button]:w-full lg:order-5 lg:w-auto lg:[&>button]:w-auto">{addAction}</div>
        </div>
      </header>
    </>
  );
}
