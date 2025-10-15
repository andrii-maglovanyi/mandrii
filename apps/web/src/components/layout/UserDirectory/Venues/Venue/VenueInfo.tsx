import { MDEditor } from "~/components/ui";
import { useTheme } from "~/contexts/ThemeContext";
import { FormProps } from "~/hooks/useForm";
import { venueDescriptionMaxCharsCount, VenueSchema } from "~/lib/validation/venue";

interface VenueInfoProps extends Pick<FormProps<VenueSchema["shape"]>, "getFieldProps"> {
  isBusy: boolean;
}

export const VenueInfo = ({ getFieldProps, isBusy }: VenueInfoProps) => {
  const { isDark } = useTheme();

  return (
    <>
      <MDEditor
        disabled={isBusy}
        isDark={isDark}
        label="Опис (🇺🇦 Українською)"
        name="description_uk"
        placeholder="Лазанья з куркою та грибами там неперевершена!!!!! Руки цілувати б тій/тому, хто це приготував."
        {...getFieldProps("description_uk")}
        maxChars={venueDescriptionMaxCharsCount}
      />

      <MDEditor
        disabled={isBusy}
        isDark={isDark}
        label="Description (🇬🇧 English)"
        name="description_en"
        placeholder="The lasagna with chicken and mushrooms there is incredible!!!!! You should kiss the hands of the one who made it."
        {...getFieldProps("description_en")}
        maxChars={venueDescriptionMaxCharsCount}
      />
    </>
  );
};
