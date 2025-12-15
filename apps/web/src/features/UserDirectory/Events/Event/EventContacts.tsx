import { Facebook, Instagram } from "lucide-react";

import { Input, RichText } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { EventSchema } from "~/lib/validation/event";

type EventContactsProps = Pick<FormProps<EventSchema["shape"]>, "getFieldProps">;

export const EventContacts = ({ getFieldProps }: EventContactsProps) => {
  const i18n = useI18n();

  const renderSocialMediaInput = (
    icon: React.ReactNode,
    name: "facebook" | "instagram",
    label: string,
    placeholder: string,
  ) => (
    <div className="flex items-center gap-2">
      <div className="mr-2">{icon}</div>
      <div className="flex grow flex-col">
        <Input label={label} placeholder={placeholder} type="url" {...getFieldProps(name)} name={name} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Input
        label={i18n("Organizer name")}
        placeholder="PMK Event Agency"
        type="text"
        {...getFieldProps("organizer_name")}
      />
      <Input
        label={i18n("Organizer email")}
        placeholder="contact@example.com"
        type="email"
        {...getFieldProps("organizer_email")}
      />
      <div className="flex flex-col">
        <RichText as="div" className="text-neutral py-2 text-sm">
          {i18n(
            "**🌍 Auto-detection enabled**.<br />Start typing with + and your country code (e.g., +1, +44, +380). The format will be automatically detected and applied for 42 countries.<br /><br />  You can add up to three phone numbers.",
          )}
        </RichText>
        <Input
          label={i18n("Organizer phone number")}
          placeholder="+44 123 456 789"
          type="tel"
          {...getFieldProps("organizer_phone_number")}
        />
      </div>

      <div className="border-primary/20 bg-primary/5 rounded-lg border-2 p-5">
        {renderSocialMediaInput(<Facebook />, "facebook", "Facebook", "https://facebook.com/puzatahata")}
        {renderSocialMediaInput(<Instagram />, "instagram", "Instagram", "https://instagram.com/puzatahata")}
      </div>
    </div>
  );
};
