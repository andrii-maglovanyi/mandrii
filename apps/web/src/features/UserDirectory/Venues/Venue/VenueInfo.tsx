import { MDEditor } from "~/components/ui";
import { useTheme } from "~/contexts/ThemeContext";
import { FormProps } from "~/hooks/form/useForm";
import { venueDescriptionMaxCharsCount, VenueSchema } from "~/lib/validation/venue";

type VenueInfoProps = Pick<FormProps<VenueSchema["shape"]>, "getFieldProps">;

export const VenueInfo = ({ getFieldProps }: VenueInfoProps) => {
  const { isDark } = useTheme();

  return (
    <>
      <MDEditor
        isDark={isDark}
        label="Опис (🇺🇦 Українською)"
        placeholder="Лазанья з куркою та грибами там неперевершена!!!!! Руки цілувати б тій/тому, хто це приготував."
        {...getFieldProps("description_uk")}
        maxChars={venueDescriptionMaxCharsCount}
      />

      <MDEditor
        isDark={isDark}
        label="Description (🇬🇧 English)"
        placeholder="The lasagna with chicken and mushrooms there is incredible!!!!! You should kiss the hands of the one who made it."
        {...getFieldProps("description_en")}
        maxChars={venueDescriptionMaxCharsCount}
      />
    </>
  );
};
