import { ArrowRight, CornerRightDown } from "lucide-react";
import React from "react";

import { Link } from "~/i18n/navigation";

export const Breadcrumbs = ({ items }: { items: Array<{ title: string; url?: string }> }) => {
  const list = items
    .reduce(
      (acc, { title, url }, index) => {
        if (index > 0) {
          acc.push(<ArrowRight className="mx-2 min-w-6" />);
        }

        acc.push(
          url ? (
            <Link className={`opacity-80 hover:underline hover:opacity-100`} href={url}>
              {title}
            </Link>
          ) : (
            <span className="cursor-default">{title}</span>
          ),
        );

        return acc;
      },
      [
        <span className="m-2 cursor-default font-bold opacity-80" key="root">
          /
        </span>,
      ],
    )
    .map((item) => () => item);

  return (
    <div
      className={`text-neutral-disabled flex items-center overflow-clip text-left text-nowrap md:scale-100 md:text-xl`}
    >
      {list.map((Item, index) => (
        <Item key={index} />
      ))}
      <CornerRightDown className="mx-2 mt-4 min-w-6" />
    </div>
  );
};
