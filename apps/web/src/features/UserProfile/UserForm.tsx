"use client";

import { AtSign, Lock } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

import { Avatar, FormFooter, ImagePreview } from "~/components/layout";
import { Button, FilePicker, Input, LocationAutocomplete, MDEditor, RichText, Tooltip } from "~/components/ui";
import { useTheme } from "~/contexts/ThemeContext";
import { OnFormSubmitHandler, useForm } from "~/hooks/form/useForm";
import { useImageUploadPreparation } from "~/hooks/useImageUploadPreparation";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_PROFILES } from "~/lib/images/uploadConfig";
import { getUserSchema } from "~/lib/validation/user";
import { UserSession } from "~/types/user";

interface UserFormProps {
  onSubmit: OnFormSubmitHandler;
  onSuccess(): void;
  profile: UserSession;
}

export const UserForm = ({ onSubmit, onSuccess, profile }: UserFormProps) => {
  const i18n = useI18n();
  const { isDark } = useTheme();
  const { showError } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const { getFieldProps, hasChanges, isFormValid, resetForm, setValues, useFormSubmit, useImagePreviews, values } =
    useForm({
      initialValues: profile,
      schema: getUserSchema(i18n),
    });

  const { handleSubmit, status } = useFormSubmit({
    onSubmit: (body) => {
      if (!body.has("bio")) body.set("bio", "");
      if (!body.has("city")) body.set("city", "");
      if (!body.has("username")) body.set("username", "");
      return onSubmit(body);
    },
    onSuccess: async () => {
      await onSuccess();
      setIsEditing(false);
    },
  });

  const { previews, removePreview } = useImagePreviews("image");
  const { isPreparing: isPreparingImage, prepareImages } = useImageUploadPreparation(
    IMAGE_UPLOAD_PROFILES.profile.maxBytes,
  );

  const isBusy = status === "processing";

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const addImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    try {
      const [image] = await prepareImages(files.slice(0, 1));
      if (image) setValues((current) => ({ ...current, image }));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to prepare photos"));
    }
  };

  return (
    <div className="mt-4 flex grow flex-col">
      <form onSubmit={isPreparingImage ? (event) => event.preventDefault() : handleSubmit}>
        <div className={`flex flex-col items-center gap-6 text-center md:flex-row md:text-left`}>
          {isEditing ? (
            <div className="h-44 w-44 overflow-hidden">
              {previews.length > 0 ? (
                <ImagePreview
                  isBusy={isBusy}
                  onRemove={removePreview}
                  previewAlt={i18n("Preview image")}
                  previewUrl={previews[0]?.url}
                  removeLabel={i18n("Remove image")}
                />
              ) : (
                <FilePicker
                  className="h-44 w-44"
                  {...getFieldProps("image")}
                  accept={IMAGE_UPLOAD_ACCEPT}
                  disabled={isPreparingImage}
                  label={isPreparingImage ? i18n("Preparing photos") : i18n("User image")}
                  onChange={(event) => void addImage(event)}
                  placeholder={i18n("Click to upload")}
                />
              )}
            </div>
          ) : (
            <Avatar avatarSize={174} className={`border-primary m-0 rounded-full border`} profile={profile} />
          )}
          <div className="flex w-full max-w-sm grow flex-col">
            {isEditing ? (
              <Input placeholder={`${i18n("Your name")}`} required {...getFieldProps("name")} />
            ) : (
              <h1 className="text-3xl font-bold text-nowrap md:mb-3 md:text-5xl">{values.name}</h1>
            )}
            {isEditing ? (
              <Input placeholder="Your username" prefix={<AtSign size={18} />} {...getFieldProps("username")} />
            ) : values.username ? (
              <p className="text-primary my-4 flex items-center gap-0.5 text-lg font-medium">
                <AtSign className="stroke-primary" strokeWidth={3} size={16} />
                {values.username}
              </p>
            ) : null}
            <div className={`text-neutral flex items-center justify-center gap-2 md:justify-start`}>
              <Tooltip label={i18n("Your email address cannot be changed.")} position="top">
                <Lock className="stroke-neutral-disabled" size={16} />
              </Tooltip>
              {profile.email}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          {isEditing ? (
            <LocationAutocomplete
              label={i18n("Location")}
              {...getFieldProps("city")}
              onLocationSelect={(city) => setValues((current) => ({ ...current, city }))}
              placeholder={i18n("Search street, city, or region...")}
            />
          ) : values.city ? (
            <p className="text-neutral mt-3">{values.city}</p>
          ) : null}
          {isEditing ? (
            <MDEditor
              height={250}
              isDark={isDark}
              label={i18n("About you")}
              maxChars={500}
              placeholder={i18n("Tell the community a little about yourself. Markdown formatting is supported.")}
              preview={isMobile ? "edit" : "live"}
              {...getFieldProps("bio")}
            />
          ) : values.bio ? (
            <RichText className="text-on-surface mt-4">{values.bio}</RichText>
          ) : null}
        </div>

        {isEditing ? (
          <FormFooter
            disabled={isPreparingImage}
            handleCancel={handleCancel}
            hasChanges={hasChanges}
            isFormValid={isFormValid}
            status={status}
          />
        ) : (
          <div className={`mt-16 flex flex-col justify-center md:flex-row md:justify-end`}>
            <Button onClick={() => setIsEditing(true)} variant="outlined">
              {i18n("Edit")}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
