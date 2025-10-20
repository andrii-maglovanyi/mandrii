"use client";

import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useUser } from "~/hooks/useUser";

import { UserForm } from "./UserForm";

export const UserProfile = () => {
  const { data, isLoading } = useUser();

  if (isLoading || !data) {
    return <AnimatedEllipsis centered size="md" />;
  }

  return (
    <div className="mt-4 flex flex-grow flex-col space-y-6">
      <UserForm />
    </div>
  );
};
