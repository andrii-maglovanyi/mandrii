"use client";

import { CalendarHeart, LayoutDashboard, Star } from "lucide-react";

import { useI18n } from "~/i18n/useI18n";

type CommunityImpactProps = {
  eventsCreated?: number;
  points?: number;
  venuesCreated?: number;
};

export const CommunityImpact = ({ eventsCreated = 0, points = 0, venuesCreated = 0 }: CommunityImpactProps) => {
  const i18n = useI18n();
  const stats = [
    { icon: Star, label: i18n("points"), value: points },
    { icon: LayoutDashboard, label: i18n("venues"), value: venuesCreated },
    { icon: CalendarHeart, label: i18n("events"), value: eventsCreated },
  ];

  return (
    <section>
      <h2
        className={`from-primary to-secondary mb-4 bg-linear-to-r bg-clip-text text-xl font-bold text-transparent md:text-2xl`}
      >
        {i18n("Community Impact")}
      </h2>
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3`}>
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            className={`group border-primary/20 from-primary/10 to-primary/5 relative overflow-hidden rounded-xl border bg-linear-to-br p-4`}
            key={label}
          >
            <div className="bg-primary/5 absolute -top-4 -right-4 h-24 w-24 rounded-full" />
            <div className="relative flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-neutral text-sm font-medium">{label}</span>
                <span
                  className={`from-primary to-secondary bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl`}
                >
                  {value}
                </span>
              </div>
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <Icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
