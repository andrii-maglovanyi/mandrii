"use client";

import { Lock } from "lucide-react";
import { useState } from "react";

import { Avatar, FormFooter, ImagePreview } from "~/components/layout";
import { Button, FilePicker, Input, Tooltip } from "~/components/ui";
import { OnFormSubmitHandler, useForm } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { getUserSchema } from "~/lib/validation/user";
import { UserSession } from "~/types/user";

interface UserFormProps {
  onSubmit: OnFormSubmitHandler;
  onSuccess(): void;
  profile: UserSession;
}

export const UserForm = ({ onSubmit, onSuccess, profile }: UserFormProps) => {
  const i18n = useI18n();
  const [isEditing, setIsEditing] = useState(false);

  const { getFieldProps, hasChanges, isFormValid, resetForm, useFormSubmit, useImagePreviews, values } = useForm({
    initialValues: profile,
    schema: getUserSchema(i18n),
  });

  const { handleSubmit, status } = useFormSubmit({
    onSubmit,
    onSuccess: async () => {
      await onSuccess();
      setIsEditing(false);
    },
  });

  const { previews, removePreview } = useImagePreviews("image");

  const isBusy = status === "processing";

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <div className="mt-4 flex flex-grow flex-col">
      <form onSubmit={handleSubmit}>
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
                  label={i18n("User image")}
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
              <h1 className={`mb-6 text-3xl font-bold text-nowrap md:mb-3 md:text-5xl`}>{values.name}</h1>
            )}
            <div className={`text-neutral flex items-center justify-center gap-2 md:justify-start`}>
              <Tooltip label={i18n("Your email address cannot be changed.")} position="top">
                <Lock className="stroke-neutral-disabled" size={16} />
              </Tooltip>
              {profile.email}
            </div>
          </div>
        </div>

        {isEditing ? (
          <FormFooter handleCancel={handleCancel} hasChanges={hasChanges} isFormValid={isFormValid} status={status} />
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
