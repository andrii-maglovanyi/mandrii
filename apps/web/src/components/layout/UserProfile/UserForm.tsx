"use client";

import { useLocale } from "next-intl";
import { FormEvent, use, useEffect, useState } from "react";
import { ZodError } from "zod";

import { Button, FilePicker, ImagePreview, Input, Tooltip } from "~/components/ui";
import { useForm } from "~/hooks/useForm";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { getUserSchema, UserFormData } from "~/lib/validation/user";
import { Locale, Status } from "~/types";
import { UUID } from "~/types/uuid";

import { Avatar } from "../Avatar/Avatar";
import { Lock } from "lucide-react";
import { constants } from "~/lib/constants";
import { UrlHelper } from "~/lib/url-helper";
import { is } from "date-fns/locale";

interface ImageFile {
  file: File;
  url: string;
}

interface FileOptions {
  name?: string;
  type?: string;
}

async function createFileFromUrl(url: string, options: FileOptions = {}): Promise<File> {
  const response = await fetch(UrlHelper.isAbsoluteUrl(url) ? url : `${constants.vercelBlobStorageUrl}/${url}`);
  const blob = await response.blob();

  const file = new File([blob], options.name || "file", {
    type: options.type || blob.type,
  });

  return file;
}

async function submitProfile(body: FormData, locale: string) {
  const res = await fetch(`/api/user/save?locale=${locale}`, {
    body,
    method: "POST",
  });
  const result = await res.json();
  return { errors: result.errors, ok: res.ok };
}

function buildFormData(data: UserFormData): FormData {
  const body = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      for (const val of value.filter(Boolean)) {
        body.append(key, val);
      }
      continue;
    }

    if (!value) continue;

    if (value instanceof File) {
      body.append(key, value);
    } else if (typeof value === "object") {
      body.append(key, JSON.stringify(value));
    } else {
      body.append(key, String(value));
    }
  }

  return body;
}

export const UserForm = () => {
  const i18n = useI18n();
  const [formStatus, setFormStatus] = useState<Status>("idle");
  const [isEditing, setIsEditing] = useState(false);
  const locale = useLocale() as Locale;
  const { showSuccess } = useNotifications();
  const { data, isLoading, refetchProfile, update: updateSession } = useUser();
  const [avatarPreview, setAvatarPreview] = useState<ImageFile | null>();

  const currentUser = data?.user;

  const { getFieldProps, isFormValid, resetForm, setFieldErrorsFromServer, setValues, validateForm, values } = useForm({
    initialValues: {
      id: currentUser?.id as UUID,
      name: currentUser?.name ?? i18n("Someone"),
      avatar: undefined,
    },
    schema: getUserSchema(i18n),
  });

  const isBusy = formStatus === "processing" || isLoading;

  useEffect(() => {
    if (!currentUser?.image) {
      return;
    }

    const image = currentUser.image;

    (async () => {
      const avatar = image ? await createFileFromUrl(image) : null;

      setValues((prev) => ({
        ...prev,
        avatar,
      }));
    })();
  }, [currentUser?.image, isEditing]);

  useEffect(() => {
    const avatar = values.avatar;
    setAvatarPreview(avatar ? { file: avatar, url: URL.createObjectURL(avatar) } : null);
  }, [values.avatar]);

  async function handleSuccess() {
    showSuccess(i18n("Profile updated successfully"));

    await refetchProfile();

    await updateSession();

    setFormStatus("idle");
    setIsEditing(false);
  }

  async function handleError(result: { errors?: ZodError["issues"] }) {
    setFormStatus("error");
    if (result.errors) {
      setFieldErrorsFromServer(result.errors);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validatedValues = validateForm();
    if (!validatedValues) {
      return;
    }

    setFormStatus("processing");

    try {
      const body = buildFormData(validatedValues);
      const result = await submitProfile(body, locale);

      if (result.ok) {
        await handleSuccess();
      } else {
        await handleError(result);
      }
    } catch {
      setFormStatus("error");
    }
  };

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

  if (!currentUser) {
    return null;
  }

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
            <Avatar avatarSize={174} className={`border-primary m-0 rounded-full border`} profile={data} />
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

        <div className="mt-8 flex flex-col justify-center md:flex-row md:justify-end">
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
      </form>
    </div>
  );
};
