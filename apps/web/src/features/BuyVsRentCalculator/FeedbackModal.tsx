"use client";

import { Modal } from "~/components/ui/Modal/Modal";
import { ContactForm } from "~/components/layout/Contact/ContactForm";
import { useI18n } from "~/i18n/useI18n";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const FeedbackModal = ({ isOpen, onClose, featureName }: FeedbackModalProps) => {
  const i18n = useI18n();

  // Build the prefilled message
  const prefillMessage = `Feature: ${featureName}\n`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={i18n("Found an issue or have feedback?")}>
      <div className="max-h-[70vh] overflow-y-auto">
        <ContactForm template={prefillMessage} />
      </div>
    </Modal>
  );
};
