"use client";

import { Notification } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";

export const NotificationsTicker = () => {
  const { dismissNotification, notifications } = useNotifications();

  return notifications.map(({ header, id, message, variant }, index) => (
    <Notification
      header={header}
      index={index}
      key={id}
      message={message}
      onClose={() => dismissNotification(id)}
      open={Boolean(id)}
      variant={variant}
    />
  ));
};
