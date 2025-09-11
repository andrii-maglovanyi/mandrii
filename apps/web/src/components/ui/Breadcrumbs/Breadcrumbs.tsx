import { ArrowRight, CornerRightDown } from "lucide-react";
import Link from "next/link";
import React from "react";

export const Breadcrumbs = ({ items }: { items: Array<{ title: string; url?: string }> }) => {
  const list = items
    .reduce(
      (acc, { title, url }, index) => {
        if (index > 0) {
          acc.push(<ArrowRight className="mx-2" />);
        }

        acc.push(
          url ? (
            <Link className={`
              text-lg font-medium opacity-80
              hover:underline hover:opacity-100
            `} href={url}>
              {title}
            </Link>
          ) : (
            <span className="cursor-default text-lg font-medium">{title}</span>
          ),
        );

        return acc;
      },
      [
        <span className="m-2 cursor-default text-xl font-bold opacity-80" key="root">
          /
        </span>,
      ],
    )
    .map((item) => () => item);

  return (
    <div className="flex items-center text-neutral-disabled">
      {list.map((Item, index) => (
        <Item key={index} />
      ))}
      <CornerRightDown className="mx-2 mt-4" />
    </div>
  );
};
