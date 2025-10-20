"use client";

import { useLocale } from "next-intl";
import { FormEvent, useState } from "react";
import { ZodError } from "zod";
import { Button, Input } from "~/components/ui";
import { useForm } from "~/hooks/useForm";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";

import { useI18n } from "~/i18n/useI18n";
import { getUserSchema } from "~/lib/validation/user";
import { Locale, Status, Users } from "~/types";
import { Avatar } from "../Avatar/Avatar";
import { UUID } from "~/types/uuid";
import { Session } from "next-auth";

interface UserFormProps {
  profile: Session;
}

async function submitProfile(body: Partial<Users>, locale: string) {
  const res = await fetch(`/api/user/save?locale=${locale}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(body),
  });

  const result = await res.json();

  return { errors: result.errors, ok: res.ok };
}

export const UserForm = ({ profile: sessionProfile }: UserFormProps) => {
  const i18n = useI18n();
  const [formStatus, setFormStatus] = useState<Status>("idle");
  const [isEditing, setIsEditing] = useState(false);
  const locale = useLocale() as Locale;
  const { showSuccess } = useNotifications();
  const { data, update: updateSession, refetchProfile, isLoading } = useUser();

  const currentUser = data?.user;

  const { getFieldProps, isFormValid, setFieldErrorsFromServer, setValues, validateForm, values } = useForm({
    initialValues: {
      id: currentUser?.id as UUID,
      name: currentUser?.name ?? i18n("Someone"),
    },
    schema: getUserSchema(i18n),
  });

  const isBusy = formStatus === "processing" || isLoading;

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

    if (!validateForm()) {
      return;
    }

    setFormStatus("processing");

    try {
      const result = await submitProfile(values, locale);

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
    setValues({
      id: currentUser?.id as UUID,
      name: currentUser?.name ?? i18n("Someone"),
    });
    setIsEditing(false);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-grow flex-col space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-4">
          <Avatar profile={sessionProfile} avatarSize={120} className="bg-neutral-disabled rounded-full p-1" />
          <div className="flex max-w-sm grow flex-col">
            {isEditing ? (
              <Input
                disabled={isBusy}
                name="name"
                placeholder={`${i18n("Your name")}`}
                required
                {...getFieldProps("name")}
              />
            ) : (
              <h1 className="mb-3 text-5xl font-bold">{values.name}</h1>
            )}
            <div>{currentUser.email}</div>
          </div>
        </div>

        <div className="flex justify-end">
          {isEditing ? (
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={handleCancel} disabled={isBusy}>
                {i18n("Cancel")}
              </Button>
              <Button variant="filled" type="submit" disabled={!isFormValid || isBusy}>
                {i18n("Save")}
              </Button>
            </div>
          ) : (
            <Button variant="outlined" onClick={() => setIsEditing(true)}>
              {i18n("Edit")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
