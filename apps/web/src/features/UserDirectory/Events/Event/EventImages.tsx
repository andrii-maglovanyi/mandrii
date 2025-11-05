import { ImagePreview } from "~/components/layout";
import { FilePicker } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { EventSchema } from "~/lib/validation/event";

type EventImagesProps = Pick<FormProps<EventSchema["shape"]>, "getFieldProps" | "setValues" | "useImagePreviews">;
const MAX_IMAGES = 3;

export const EventImages = ({ getFieldProps, useImagePreviews }: EventImagesProps) => {
  const i18n = useI18n();

  const { previews: imagePreviews, removePreview: removeImagePreview } = useImagePreviews("images");

  return (
    <>
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
    </>
  );
};
