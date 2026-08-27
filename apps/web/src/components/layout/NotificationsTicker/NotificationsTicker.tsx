"use client";

import { useEffect, useRef } from "react";

import { Notification } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";

export const NotificationsTicker = () => {
  const { dismissNotification, notifications } = useNotifications();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiseAboveModal = () => {
      const popover = popoverRef.current;
      if (!popover?.showPopover) return;

      if (popover.matches(":popover-open")) popover.hidePopover();
      popover.showPopover();
    };

    raiseAboveModal();

    // `dialog.showModal()` puts the dialog and its backdrop in the browser's
    // top layer. Re-open the notification popover after that happens so it is
    // painted above the backdrop, while still staying anchored to the viewport.
    const observer = new MutationObserver((records) => {
      if (records.some((record) => record.target instanceof HTMLDialogElement && record.target.open)) {
        requestAnimationFrame(raiseAboveModal);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["open"], subtree: true });

    return () => {
      observer.disconnect();
      popoverRef.current?.hidePopover?.();
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0"
      popover="manual"
      ref={popoverRef}
    >
      {notifications.map(({ header, id, message, variant }, index) => (
        <Notification
          header={header}
          index={index}
          key={id}
          message={message}
          onClose={() => dismissNotification(id)}
          open={Boolean(id)}
          variant={variant}
        />
      ))}
    </div>
  );
};
