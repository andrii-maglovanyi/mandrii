"use client";

import { useUser } from "~/hooks/useUser";

import { UserForm } from "./UserForm";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";

export const UserProfile = () => {
  const { data, isLoading } = useUser();

  if (isLoading || !data?.user) {
    return <AnimatedEllipsis centered size="md" />;
  }

  return (
    <div className="mt-4 flex flex-grow flex-col space-y-6">
      <UserForm profile={data} />
    </div>
  );
};
