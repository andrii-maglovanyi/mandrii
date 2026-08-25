"use client";

import { CalendarHeart, LayoutDashboard, Star } from "lucide-react";

import { TextLink } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { CommunityAchievements } from "~/features/Gamification/CommunityAchievements";
import { CommunityLevelProgress } from "~/features/Gamification/CommunityLevel";

type CommunityImpactProps = {
  activeDays?: number;
  eventsCreated?: number;
  isVerified?: boolean;
  points?: number;
  showLeaderboardLink?: boolean;
  venuesCreated?: number;
};

export const CommunityImpact = ({
  activeDays = 0,
  eventsCreated = 0,
  isVerified = false,
  points = 0,
  showLeaderboardLink = true,
  venuesCreated = 0,
}: CommunityImpactProps) => {
  const i18n = useI18n();
  const stats = [
    { icon: Star, label: i18n("points"), value: points },
    { icon: LayoutDashboard, label: i18n("venues"), value: venuesCreated },
    { icon: CalendarHeart, label: i18n("events"), value: eventsCreated },
  ];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          className={`from-primary to-secondary bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent md:text-2xl`}
        >
          {i18n("Community impact")}
        </h2>
        {showLeaderboardLink && (
          <TextLink href="/leaderboard">
            <Star aria-hidden size={20} className="fill-primary" />
            {i18n("Leaderboard")}
          </TextLink>
        )}
      </div>
      <div className="mb-4">
        <CommunityLevelProgress isVerified={isVerified} points={points} />
        <p className="text-neutral mt-2 text-right text-sm">
          {i18n("Points are awarded once a venue or event is published")}
        </p>
      </div>
      <div className="my-4">
        <CommunityAchievements
          activeDays={activeDays}
          events={eventsCreated}
          isVerified={isVerified}
          points={points}
          venues={venuesCreated}
        />
      </div>
      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            className="group border-primary/20 from-primary/10 to-primary/5 relative overflow-hidden rounded-xl bg-linear-to-br p-3 sm:p-4"
            key={label}
          >
            <div className="bg-primary/5 absolute -top-4 -right-4 h-24 w-24 rounded-full" />
            <div className="relative">
              <span className="text-neutral block text-xs font-medium sm:text-sm">{label}</span>
              <span className="from-primary to-secondary mt-1 block bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl md:text-4xl">
                {value}
              </span>
              <div className="bg-primary/10 text-primary absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
