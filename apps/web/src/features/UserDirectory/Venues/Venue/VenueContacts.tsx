import { AtSign, Facebook, Globe, Instagram, Minus, Phone, Plus, Users } from "lucide-react";
import { useCallback } from "react";

import { AccordionItem, ActionButton, Input, MultipleAccordion, RichText } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { VenueSchema } from "~/lib/validation/venue";

type VenueContactsProps = Pick<FormProps<VenueSchema["shape"]>, "getFieldProps" | "getFieldsProps" | "setValues">;

export const VenueContacts = ({ getFieldProps, getFieldsProps, setValues }: VenueContactsProps) => {
  const i18n = useI18n();

  const createAddHandler = useCallback(
    (field: "emails" | "phone_numbers") => {
      setValues((prev) => ({
        ...prev,
        [field]: [...(prev[field]?.length ? prev[field] : [""]), ""],
      }));
    },
    [setValues],
  );

  const createRemoveHandler = useCallback(
    (field: "emails" | "phone_numbers", index: number) => {
      setValues((prev) => {
        const updatedField = (prev[field] || []).filter((_, i) => i !== index);
        return { ...prev, [field]: updatedField };
      });
    },
    [setValues],
  );

  const addEmail = () => createAddHandler("emails");
  const removeEmail = (index: number) => createRemoveHandler("emails", index);
  const addPhoneNumber = () => createAddHandler("phone_numbers");
  const removePhoneNumber = (index: number) => createRemoveHandler("phone_numbers", index);

  const renderDynamicFields = (
    fieldName: "emails" | "phone_numbers",
    label: string,
    placeholder: string,
    addHandler: () => void,
    removeHandler: (index: number) => void,
    extraProps?: Record<string, unknown>,
  ) => {
    const fields = getFieldsProps(fieldName);
    const maxFields = 3;

    return (
      <>
        {fields.map((fieldProps, index) => (
          <div className="mt-2 flex gap-2" key={index}>
            <div className="flex grow flex-col">
              <Input
                label={`${label} ${index + 1}`}
                placeholder={placeholder}
                {...extraProps}
                {...fieldProps}
                name={fieldName}
              />
            </div>
            {index > 0 && (
              <ActionButton
                aria-label={fieldName === "emails" ? i18n("Remove email") : i18n("Remove phone number")}
                className="mt-1"
                icon={<Minus />}
                onClick={() => removeHandler(index)}
                tooltipPosition="left"
                type="button"
              />
            )}
          </div>
        ))}
        {fields.length < maxFields && (
          <div className="flex justify-end">
            <ActionButton
              aria-label={fieldName === "emails" ? i18n("Add email") : i18n("Add phone number")}
              icon={<Plus />}
              onClick={addHandler}
              tooltipPosition="left"
              type="button"
              variant="filled"
            />
          </div>
        )}
      </>
    );
  };

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
    <MultipleAccordion>
      <AccordionItem icon={<Globe size={20} />} isOpen title={i18n("Website")}>
        <div className="flex grow flex-col">
          <Input
            label={i18n("Website")}
            placeholder="https://puzatahata.co.uk"
            type="url"
            {...getFieldProps("website")}
          />
        </div>
      </AccordionItem>

      <AccordionItem icon={<AtSign size={20} />} title={i18n("Email")}>
        <p className="text-neutral pt-2 pb-4 text-sm">{i18n("You can add up to three emails.")}</p>
        <div className="flex grow flex-col">
          {renderDynamicFields("emails", i18n("Email"), "varenyk@puzatahata.co.uk", addEmail, removeEmail)}
        </div>
      </AccordionItem>

      <AccordionItem icon={<Phone size={20} />} title={i18n("Phone number")}>
        <div className="flex grow flex-col">
          <RichText as="div" className="text-neutral py-2 text-sm">
            {i18n(
              "**🌍 Auto-detection enabled**.<br />Start typing with + and your country code (e.g., +1, +44, +380). The format will be automatically detected and applied for 42 countries.<br /><br />  You can add up to three phone numbers.",
            )}
          </RichText>
          {renderDynamicFields(
            "phone_numbers",
            i18n("Phone number"),
            "+44 20 7946 0123",
            addPhoneNumber,
            removePhoneNumber,
            {
              type: "tel",
            },
          )}
        </div>
      </AccordionItem>

      <AccordionItem icon={<Users size={20} />} title={i18n("Social media")}>
        {renderSocialMediaInput(<Facebook />, "facebook", "Facebook", "https://facebook.com/puzatahata")}
        {renderSocialMediaInput(<Instagram />, "instagram", "Instagram", "https://instagram.com/puzatahata")}
      </AccordionItem>
    </MultipleAccordion>
  );
};
