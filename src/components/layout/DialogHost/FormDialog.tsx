import { FormEvent, FormEventHandler } from "react";

import { Button } from "~/components/ui";
import { Modal, ModalProps } from "~/components/ui/Modal/Modal";
import { useI18n } from "~/i18n/useI18n";

export interface FormDialogProps extends ModalProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export type FormProps = Pick<ModalProps, "children" | "title">;

export const FormDialog = ({
  children,
  onClose,
  onSubmit,
  ...props
}: FormDialogProps) => {
  const i18n = useI18n();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal {...props}>
      <form onSubmit={handleSubmit}>
        {children}

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="ghost">
            {i18n("Cancel")}
          </Button>
          <Button color="primary" type="submit" variant="filled">
            {i18n("Submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
