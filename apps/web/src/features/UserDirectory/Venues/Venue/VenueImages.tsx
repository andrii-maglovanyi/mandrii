import { Frame, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ImagePreview } from "~/components/layout";
import { AccordionItem, FilePicker, MultipleAccordion } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { VenueSchema } from "~/lib/validation/venue";

interface ImageFile {
  file: File;
  url: string;
}

interface VenueImagesProps extends Pick<FormProps<VenueSchema["shape"]>, "getFieldProps" | "setValues" | "values"> {
  isBusy: boolean;
}

const MAX_IMAGES = 6;

export const VenueImages = ({ getFieldProps, isBusy, setValues, values }: VenueImagesProps) => {
  const i18n = useI18n();
  const [logoPreview, setLogoPreview] = useState<ImageFile | null>();
  const [imagePreviews, setImagePreviews] = useState<ImageFile[]>([]);

  useEffect(() => {
    const images = values.images ?? [];

    const previews = images.map((file) => {
      const alreadyExistingImage = imagePreviews.find((image) => image.file.name === file.name);
      if (alreadyExistingImage) {
        return alreadyExistingImage;
      }

      return { file, url: URL.createObjectURL(file) };
    });

    setImagePreviews(previews);

    return () => {
      for (const preview of imagePreviews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [values.images]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const logo = values.logo;
    setLogoPreview(logo ? { file: logo, url: URL.createObjectURL(logo) } : null);
  }, [values.logo]);

  const removeLogo = () => {
    setValues((prev) => ({
      ...prev,
      logo: undefined,
    }));
  };

  const removeImage = (index: number) => {
    setValues((prev) => ({
      ...prev,
      images: values.images?.filter((_, i) => i !== index),
    }));
  };

  return (
    <MultipleAccordion>
      <AccordionItem icon={<Frame size={20} />} isOpen title={i18n("Logo")}>
        <div className="m-auto max-h-56 max-w-56 overflow-hidden">
          {logoPreview ? (
            <ImagePreview
              isBusy={isBusy}
              onRemove={removeLogo}
              previewAlt={i18n("Preview logo")}
              previewUrl={logoPreview.url}
              removeLabel={i18n("Remove logo")}
            />
          ) : (
            <FilePicker
              disabled={isBusy}
              name="logo"
              {...getFieldProps("logo")}
              label={i18n("Venue logo")}
              placeholder={i18n("Click to upload")}
            />
          )}
        </div>
      </AccordionItem>

      <AccordionItem icon={<ImageIcon size={20} />} title={i18n("Images")}>
        <div>
          <label className="mb-2 block font-semibold">
            {i18n("Upload images")}
            <span className="ml-2 text-sm font-normal text-neutral">
              ({i18n("{addedImages}/{maxImages} images", { addedImages: imagePreviews.length, maxImages: MAX_IMAGES })})
            </span>
          </label>

          <FilePicker
            disabled={isBusy}
            isMultiple
            name="images"
            {...getFieldProps("images")}
            label={i18n("Click to upload images")}
            placeholder={i18n("{number} images remaining", { number: Math.max(0, MAX_IMAGES - imagePreviews.length) })}
          />
        </div>

        {imagePreviews.length > 0 && (
          <div className={`
            mt-8 grid grid-cols-1 gap-4
            sm:grid-cols-2
            md:grid-cols-3
          `}>
            {imagePreviews.map((preview, index) => (
              <ImagePreview
                isBusy={isBusy}
                key={preview.url}
                number={index + 1}
                onRemove={() => removeImage(index)}
                previewAlt={i18n("Preview {number}", { number: index + 1 })}
                previewUrl={preview.url}
                removeLabel={i18n("Remove image {number}", { number: index + 1 })}
              />
            ))}
          </div>
        )}
      </AccordionItem>
    </MultipleAccordion>
  );
};
