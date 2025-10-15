"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { ActionButton } from "../Button/ActionButton";

export interface ModalProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}

export const MODAL_ANIMATION_TIMEOUT = 200;

export const Modal = ({ children, isOpen, onClose, title }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };

    document.addEventListener("keydown", handleEsc);

    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);

      const timeout = setTimeout(() => {
        dialog.close();
      }, MODAL_ANIMATION_TIMEOUT);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  const isVisibleClass = isVisible
    ? "opacity-100 md:-translate-y-1/2 translate-y-0"
    : "opacity-0 md:-translate-y-1/3 translate-y-10";

  const animationClass = `transition-all duration-300 ${isVisibleClass}`;

  const backdropClass = "backdrop:backdrop-blur-xs backdrop:bg-neutral-800/20 dark:backdrop:bg-neutral-200/20";
  const positionClass = "md:top-1/2 md:left-1/2 md:right-1/2 md:bottom-auto md:-translate-x-1/2 md:max-w-lg";
  const layoutClass = "bg-surface text-on-surface w-full z-50 rounded-xl p-6 shadow-x overflow-visible";
  const mobileClass = "bottom-0 mt-auto mx-auto mb-4";

  const modalClass = clsx(layoutClass, positionClass, animationClass, backdropClass, mobileClass, `fixed`);

  return ReactDOM.createPortal(
    <dialog aria-labelledby="modal-title" aria-modal="true" className={modalClass} ref={dialogRef}>
      <div className="fixed -top-12 right-0">
        <ActionButton
          aria-label="Close modal"
          data-testid="close-modal"
          icon={<X />}
          onClick={onClose}
          tooltipPosition="left"
          variant="ghost"
        />
      </div>
      <div className="mb-4 flex items-center">{title && <h2 className={`text-xl font-normal`}>{title}</h2>}</div>
      <div className="mb-6">{children}</div>
    </dialog>,
    document.body,
  );
};
