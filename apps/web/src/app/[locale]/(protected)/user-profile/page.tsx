import { MixpanelTracker, UserProfile } from "~/components/layout";

export default function UserProfilePage() {
  return (
    <>
      <UserProfile />
      <MixpanelTracker event="Viewed Profile Page" />
    </>
  );
}
