import type { ReactNode } from "react";

import { Breadcrumbs } from "~/components/ui";
import { BreadcrumbsProps } from "~/components/ui/Breadcrumbs/Breadcrumbs";

type PublicPageHeaderProps = {
  breadcrumbs: BreadcrumbsProps;
  title: string;
  description: string;
  actionButtons?: ReactNode;
};

export const PublicPageHeader = ({
  breadcrumbs,
  actionButtons,
  description,
  title,
}: Readonly<PublicPageHeaderProps>) => {
  return (
    <header className="mb-4">
      <Breadcrumbs items={breadcrumbs} />

      <div className="flex flex-col items-start justify-between gap-1 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex-col">
          <h1 className="from-primary to-secondary ml-8 bg-linear-to-r bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
            {title}
          </h1>
          <p className="text-neutral mt-1 mb-4 ml-8">{description}</p>
        </div>

        <div className="ml-auto flex w-full flex-col justify-center gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          {actionButtons}
        </div>
      </div>
    </header>
  );
};
