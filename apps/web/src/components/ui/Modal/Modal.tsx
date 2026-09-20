"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import ReactDOM from "react-dom";

import { useI18n } from "~/i18n/useI18n";

import { ActionButton } from "../Button/ActionButton";

export interface ModalProps {
  children: React.ReactNode;
  className?: string;
  height?: "auto" | "conversation";
  isOpen?: boolean;
  onClose?: () => void;
  scrollable?: boolean;
  title?: string;
}

const subscribeHydration = () => () => {};

export const MODAL_ANIMATION_TIMEOUT = 200;

export const Modal = ({
  children,
  className = "mb-6",
  height = "auto",
  isOpen,
  onClose,
  scrollable = false,
  title,
}: ModalProps) => {
  const i18n = useI18n();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(
    () => () => {
      // DialogHost removes dialogs immediately; native close() cannot restore focus then.
      const opener = openerRef.current;
      const remainingDialog = document.querySelector("dialog[open]");
      if (opener?.isConnected && !opener.closest("[inert]") && (!remainingDialog || remainingDialog.contains(opener))) {
        opener.focus({ preventScroll: true });
      }
    },
    [],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialogRef.current && onClose) {
        onClose();
      }
    };

    dialog.addEventListener("click", handleBackdropClick);
    return () => dialog.removeEventListener("click", handleBackdropClick);
  }, [onClose, hydrated]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let frame: number;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      if (!dialog.open) {
        try {
          openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          dialog.showModal();
        } catch (error) {
          console.error("Failed to show modal:", error);
          return;
        }
      }
      frame = requestAnimationFrame(() => {
        dialog.focus({ preventScroll: true });
        setIsVisible(true);
      });
    } else {
      frame = requestAnimationFrame(() => setIsVisible(false));
      timeout = setTimeout(() => {
        if (dialog.open) dialog.close();
      }, MODAL_ANIMATION_TIMEOUT);
    }
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [isOpen, hydrated]);

  if (!hydrated) return null;

  const isVisibleClass = isVisible
    ? "opacity-100 md:-translate-y-1/2 translate-y-0"
    : "opacity-0 md:-translate-y-1/3 translate-y-10";

  const animationClass = `transition-all duration-300 ${isVisibleClass}`;

  const backdropClass = "backdrop:backdrop-blur-xs backdrop:bg-neutral-800/20 dark:backdrop:bg-neutral-200/20";
  const positionClass = "md:top-1/2 md:left-1/2 md:right-1/2 md:bottom-auto md:-translate-x-1/2 md:max-w-lg";
  const layoutClass = clsx(
    "z-50 w-full rounded-xl bg-surface p-6 text-on-surface shadow-xl",
    height === "conversation"
      ? `
        h-[min(42rem,calc(100dvh-2rem))]
        open:flex open:flex-col
      `
      : scrollable
        ? "max-h-[calc(100dvh-2rem)] overflow-visible"
        : "overflow-visible",
  );
  const mobileClass = "bottom-0 mt-auto mx-auto mb-4";

  const modalClass = clsx(
    layoutClass,
    positionClass,
    animationClass,
    backdropClass,
    mobileClass,
    `
    fixed
  `,
  );

  return ReactDOM.createPortal(
    <dialog
      aria-labelledby={title ? titleId : undefined}
      aria-modal="true"
      className={modalClass}
      onCancel={(event) => {
        event.preventDefault();
        if (isOpen) onClose?.();
      }}
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="fixed -top-12 right-0">
        <ActionButton
          aria-label={i18n("Close modal")}
          data-testid="close-modal"
          icon={<X />}
          onClick={onClose}
          tooltipPosition="left"
          variant="ghost"
        />
      </div>
      <div className="mb-4 flex min-h-11 items-center pr-12">
        {title && (
          <h2 className={`text-xl font-normal`} id={titleId}>
            {title}
          </h2>
        )}
      </div>
      <div
        className={clsx(
          className,
          height === "conversation" && "min-h-0 flex-1",
          scrollable && "-mx-1 max-h-[calc(100dvh-8rem)] overflow-y-auto px-1",
        )}
      >
        {children}
      </div>
    </dialog>,
    document.body,
  );
};
