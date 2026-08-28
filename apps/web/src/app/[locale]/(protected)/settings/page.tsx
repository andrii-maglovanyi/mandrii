import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { AccountSettings } from "~/features";
import { useI18n } from "~/i18n/useI18n";

export default function SettingsPage() {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/` }]} />
      <main className="mx-auto w-full max-w-3xl py-4 md:py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold md:text-5xl">{i18n("Settings")}</h1>
          <p className="text-neutral mt-2">{i18n("Manage preferences that apply across your account.")}</p>
        </header>
        <AccountSettings />
      </main>
      <MixpanelTracker event="Viewed Settings Page" />
    </>
  );
}
