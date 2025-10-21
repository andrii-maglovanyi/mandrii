"use client";

import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, Button, FilePicker, ImagePreview, Input, Tooltip } from "~/components/ui";
import { OnFormSubmitHandler, useForm } from "~/hooks/form/useForm";
import { useImagePreview } from "~/hooks/form/useImagePreview";
import { UserSession } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";

import { createFileFromUrl } from "~/lib/forms/fileUtils";
import { getUserSchema } from "~/lib/validation/user";

import { Avatar } from "../Avatar/Avatar";

interface UserFormProps {
  profile: UserSession;
  onSubmit: OnFormSubmitHandler;
  onSuccess(): void;
}

export const UserForm = ({ profile, onSubmit, onSuccess }: UserFormProps) => {
  const i18n = useI18n();
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = profile.user;

  const { getFieldProps, isFormValid, resetForm, setValues, useFormSubmit, values } = useForm({
    initialValues: {
      ...currentUser,
      avatar: undefined,
    },
    schema: getUserSchema(i18n),
  });

  const { handleSubmit, status } = useFormSubmit({
    onSubmit,
    onSuccess: async () => {
      await onSuccess();
      setIsEditing(false);
    },
  });

  const avatarPreview = useImagePreview(values.avatar);

  const isBusy = status === "processing";

  useEffect(() => {
    if (!currentUser?.image || !isEditing) {
      return;
    }

    (async () => {
      const avatar = await createFileFromUrl(currentUser.image!);
      setValues((prev) => ({ ...prev, avatar }));
    })();
  }, [currentUser?.image, isEditing, setValues]);

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const removeAvatar = () => {
    setValues((prev) => ({
      ...prev,
      avatar: undefined,
    }));
  };

  return (
    <div className="mt-4 flex flex-grow flex-col">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          {isEditing ? (
            <div className="h-44 w-44 overflow-hidden">
              {avatarPreview ? (
                <ImagePreview
                  isBusy={isBusy}
                  onRemove={removeAvatar}
                  previewAlt={i18n("Preview image")}
                  previewUrl={avatarPreview.url}
                  removeLabel={i18n("Remove image")}
                />
              ) : (
                <FilePicker
                  className="h-44 w-44"
                  disabled={isBusy}
                  name="avatar"
                  {...getFieldProps("avatar")}
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
              <Input
                disabled={isBusy}
                name="name"
                placeholder={`${i18n("Your name")}`}
                required
                {...getFieldProps("name")}
              />
            ) : (
              <h1 className="mb-6 text-3xl font-bold text-nowrap md:mb-3 md:text-5xl">{values.name}</h1>
            )}
            <div className="text-neutral flex items-center justify-center gap-2 md:justify-start">
              <Tooltip label={i18n("Your email address cannot be changed.")} position="top">
                <Lock size={16} className="stroke-neutral-disabled" />
              </Tooltip>
              {currentUser.email}
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col justify-center space-y-4 md:flex-row md:items-center md:justify-end md:space-y-0 md:space-x-4`}
        >
          <div className="my-2 h-11">
            {status === "error" && <Alert variant="error">{i18n("Failed to submit profile. Please try again.")}</Alert>}
          </div>

          <div className="flex flex-col justify-center md:flex-row md:justify-end">
            {isEditing ? (
              <div className="flex flex-col-reverse gap-2 md:flex-row md:space-x-3">
                <Button disabled={isBusy} onClick={handleCancel} variant="ghost">
                  {i18n("Cancel")}
                </Button>
                <Button disabled={!isFormValid || isBusy} type="submit" variant="filled">
                  {i18n("Save")}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outlined">
                {i18n("Edit")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
