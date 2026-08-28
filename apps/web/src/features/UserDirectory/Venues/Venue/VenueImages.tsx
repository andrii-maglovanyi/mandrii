import { Frame, Image as ImageIcon } from "lucide-react";
import { ImagePreview } from "~/components/layout";
import { AccordionItem, FilePicker, MultipleAccordion } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useImageUploadPreparation } from "~/hooks/useImageUploadPreparation";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_PROFILES } from "~/lib/images/uploadConfig";
import { VenueSchema } from "~/lib/validation/venue";

type VenueImagesProps = Pick<FormProps<VenueSchema["shape"]>, "getFieldProps" | "setValues" | "useImagePreviews"> & {
  onPreparingChange: (isPreparing: boolean) => void;
};

export const VenueImages = ({ getFieldProps, onPreparingChange, setValues, useImagePreviews }: VenueImagesProps) => {
  const i18n = useI18n();
  const { showError } = useNotifications();
  const { isPreparing, prepareImages } = useImageUploadPreparation(
    IMAGE_UPLOAD_PROFILES.venue.maxBytes,
    onPreparingChange,
  );

  const { previews: imagePreviews, removePreview: removeImagePreview } = useImagePreviews("images");
  const { previews: logoPreviews, removePreview: removeLogoPreview } = useImagePreviews("logo");

  const addLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const [logo] = await prepareImages([file]);
      if (logo) setValues((current) => ({ ...current, logo }));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to prepare photos"));
    }
  };

  const addImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const remaining = IMAGE_UPLOAD_PROFILES.venue.maxImages - imagePreviews.length;
    if (!selected.length || remaining <= 0) return;

    try {
      const prepared = await prepareImages(selected.slice(0, remaining));
      setValues((current) => ({
        ...current,
        images: [...(current.images ?? []), ...prepared].slice(0, IMAGE_UPLOAD_PROFILES.venue.maxImages),
      }));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to prepare photos"));
    }
  };

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
            <FilePicker
              {...getFieldProps("logo")}
              accept={IMAGE_UPLOAD_ACCEPT}
              disabled={isPreparing}
              label={isPreparing ? i18n("Preparing photos") : i18n("Venue logo")}
              onChange={(event) => void addLogo(event)}
              placeholder={i18n("Click to upload")}
            />
          )}
        </div>
      </AccordionItem>

      <AccordionItem icon={<ImageIcon size={20} />} title={i18n("Images")}>
        <div>
          <label className="mb-2 block font-semibold">
            {i18n("Upload images")}
            <span className="text-neutral ml-2 text-sm font-normal">
              (
              {i18n("{addedImages}/{maxImages} images", {
                addedImages: imagePreviews.length,
                maxImages: IMAGE_UPLOAD_PROFILES.venue.maxImages,
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
              number: Math.max(0, IMAGE_UPLOAD_PROFILES.venue.maxImages - imagePreviews.length),
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
      </AccordionItem>
    </MultipleAccordion>
  );
};
