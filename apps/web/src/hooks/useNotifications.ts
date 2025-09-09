import { useCallback, useContext } from "react";

import { NotificationsContext } from "~/contexts/NotificationsContext";
import { ColorVariant } from "~/types";

interface Options {
  header?: string;
}

const defaultHeaders = {
  [ColorVariant.Error]: "Error!",
  [ColorVariant.Info]: "Info!",
  [ColorVariant.Success]: "Success!",
  [ColorVariant.Warning]: "Warning!",
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("Notifications context is missing");
  }

  const { newNotification, notifications, removeNotification } = context;

  const showNotification = useCallback(
    (variant: ColorVariant, message: string, header?: string) => {
      newNotification({
        header: header ?? defaultHeaders[variant],
        message,
        variant,
      });
    },
    [newNotification],
  );

  const dismissNotification = useCallback((id: string) => removeNotification(id), [removeNotification]);

  const showSuccess = useCallback(
    (message: string, options?: Options) => showNotification(ColorVariant.Success, message, options?.header),
    [showNotification],
  );

  const showError = useCallback(
    (message: string, options?: Options) => showNotification(ColorVariant.Error, message, options?.header),
    [showNotification],
  );

  return {
    dismissNotification,
    notifications,
    showError,
    showSuccess,
  };
};
