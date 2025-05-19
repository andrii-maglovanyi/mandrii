import { useI18n } from "~/i18n/useI18n";

export default function HomePage() {
  const i18n = useI18n();

  return <div>{i18n("Hello, world!")}</div>;
}
