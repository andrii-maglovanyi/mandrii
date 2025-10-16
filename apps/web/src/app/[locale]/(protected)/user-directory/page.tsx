import { MixpanelTracker, UserDirectory } from "~/components/layout";

export default async function UserDirectoryPage() {
  return (
    <>
      <UserDirectory />
      <MixpanelTracker event="Viewed User Directory Page" />
    </>
  );
}
