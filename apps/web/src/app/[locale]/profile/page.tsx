import { MixpanelTracker, Profile } from "~/components/layout";

export default function ProfilePage() {
  return (
    <>
      <Profile />
      <MixpanelTracker event="Viewed Profile Page" />
    </>
  );
}
