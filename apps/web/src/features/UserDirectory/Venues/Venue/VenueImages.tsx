import { Frame, Image as ImageIcon } from "lucide-react";

import { ImagePreview } from "~/components/layout";
import { AccordionItem, FilePicker, MultipleAccordion } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { VenueSchema } from "~/lib/validation/venue";

type VenueImagesProps = Pick<FormProps<VenueSchema["shape"]>, "getFieldProps" | "setValues" | "useImagePreviews">;

const MAX_IMAGES = 6;

export const VenueImages = ({ getFieldProps, useImagePreviews }: VenueImagesProps) => {
  const i18n = useI18n();

  const { previews: imagePreviews, removePreview: removeImagePreview } = useImagePreviews("images");
  const { previews: logoPreviews, removePreview: removeLogoPreview } = useImagePreviews("logo");

  return (
    <MultipleAccordion>
      <AccordionItem icon={<Frame size={20} />} isOpen title={i18n("Logo")}>
        <div className="m-auto max-h-56 max-w-56 overflow-hidden">
          {logoPreviews.length ? (
            <ImagePreview
              onRemove={removeLogoPreview}
              previewAlt={i18n("Preview logo")}
              previewUrl={logoPreviews[0].url}
              removeLabel={i18n("Remove logo")}
            />
          ) : (
            <FilePicker {...getFieldProps("logo")} label={i18n("Venue logo")} placeholder={i18n("Click to upload")} />
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
            isMultiple
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
                key={preview.url}
                number={index + 1}
                onRemove={() => removeImagePreview(index)}
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
