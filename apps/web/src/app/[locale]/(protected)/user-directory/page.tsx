import { MixpanelTracker } from "~/components/layout";
import { UserDirectory } from "~/features";

export default async function UserDirectoryPage() {
  return (
    <>
      <UserDirectory />
      <MixpanelTracker event="Viewed User Directory Page" />
    </>
  );
}
