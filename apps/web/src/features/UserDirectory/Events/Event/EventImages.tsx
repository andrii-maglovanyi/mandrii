import { ImagePreview } from "~/components/layout";
import { FilePicker } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useImageUploadPreparation } from "~/hooks/useImageUploadPreparation";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_PROFILES } from "~/lib/images/uploadConfig";
import { EventSchema } from "~/lib/validation/event";

type EventImagesProps = Pick<FormProps<EventSchema["shape"]>, "getFieldProps" | "setValues" | "useImagePreviews"> & {
  onPreparingChange: (isPreparing: boolean) => void;
};
export const EventImages = ({ getFieldProps, onPreparingChange, setValues, useImagePreviews }: EventImagesProps) => {
  const i18n = useI18n();
  const { showError } = useNotifications();
  const { isPreparing, prepareImages } = useImageUploadPreparation(
    IMAGE_UPLOAD_PROFILES.event.maxBytes,
    onPreparingChange,
  );

  const { previews: imagePreviews, removePreview: removeImagePreview } = useImagePreviews("images");

  const addImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const remaining = IMAGE_UPLOAD_PROFILES.event.maxImages - imagePreviews.length;
    if (!selected.length || remaining <= 0) return;

    try {
      const prepared = await prepareImages(selected.slice(0, remaining));
      setValues((current) => ({
        ...current,
        images: [...(current.images ?? []), ...prepared].slice(0, IMAGE_UPLOAD_PROFILES.event.maxImages),
      }));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to prepare photos"));
    }
  };

  return (
    <>
      <div>
        <label className="mb-2 block font-semibold">
          {i18n("Upload images")}
          <span className="text-neutral ml-2 text-sm font-normal">
            (
            {i18n("{addedImages}/{maxImages} images", {
              addedImages: imagePreviews.length,
              maxImages: IMAGE_UPLOAD_PROFILES.event.maxImages,
            })}
            )
          </span>
        </label>

        <FilePicker
          {...getFieldProps("images")}
          accept={IMAGE_UPLOAD_ACCEPT}
          disabled={isPreparing}
          isMultiple
          label={isPreparing ? i18n("Preparing photos") : i18n("Click to upload images")}
          onChange={(event) => void addImages(event)}
          placeholder={i18n("{number} images remaining", {
            number: Math.max(0, IMAGE_UPLOAD_PROFILES.event.maxImages - imagePreviews.length),
          })}
        />
      </div>

      {imagePreviews.length > 0 && (
        <div className={`mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3`}>
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
