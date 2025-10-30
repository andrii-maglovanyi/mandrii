import { Section, Text } from "@react-email/components";

interface EmailActionBackupProps {
  i18n: (key: string, params?: Record<string, string>) => string;
  url: string;
}

export const EmailActionBackup = ({ i18n = (value: string) => value, url }: EmailActionBackupProps) =>
  url ? (
    <Section className="mt-4 text-center">
      <Text className="text-sm text-neutral-500">
        {i18n("If the button doesn't work, copy and paste this link into your browser:")}
      </Text>

      <Text className="text-sm break-all text-primary underline">{url}</Text>
    </Section>
  ) : null;
