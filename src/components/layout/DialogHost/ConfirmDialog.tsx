import { Button } from "~/components/ui";
import { Modal, ModalProps } from "~/components/ui/Modal/Modal";
import { useI18n } from "~/i18n/useI18n";

export interface ConfirmDialogProps extends ConfirmProps, ModalProps {
  message: string;
  onConfirm: () => void;
}

export type ConfirmProps = {
  message: string;
} & Pick<ModalProps, "title">;

export const ConfirmDialog = ({ message, onClose, onConfirm, ...props }: ConfirmDialogProps) => {
  const i18n = useI18n();

  return (
    <Modal {...props} onClose={onClose}>
      <p>{message}</p>

      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variant="ghost">
          {i18n("Cancel")}
        </Button>
        <Button color="primary" onClick={onConfirm} variant="filled">
          {i18n("Confirm")}
        </Button>
      </div>
    </Modal>
  );
};
