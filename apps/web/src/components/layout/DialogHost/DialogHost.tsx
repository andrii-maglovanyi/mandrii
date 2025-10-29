import { useState } from "react";

import { MODAL_ANIMATION_TIMEOUT } from "~/components/ui/Modal/Modal";
import { type DialogEntry, useDialog } from "~/contexts/DialogContext";

import { ConfirmDialog } from "./ConfirmDialog";
import { CustomDialog } from "./CustomDialog";
import { FormDialog } from "./FormDialog";

interface DialogHost {
  dialog: DialogEntry | null;
}

export const DialogHost = ({ dialog }: DialogHost) => {
  const { closeDialog } = useDialog();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);

    setTimeout(() => {
      setIsOpen(true);
      closeDialog();
    }, MODAL_ANIMATION_TIMEOUT);
  };

  if (!dialog) return;

  const { props, type } = dialog;

  switch (type) {
    case "confirm":
      return (
        <ConfirmDialog
          isOpen={isOpen}
          {...props}
          onClose={() => {
            dialog.resolve(false);
            handleClose();
          }}
          onConfirm={() => {
            dialog.resolve(true);
            props.onConfirm?.();
            handleClose();
          }}
        >
          {props.message}
        </ConfirmDialog>
      );

    case "form":
      return (
        <FormDialog
          isOpen={isOpen}
          {...props}
          onClose={() => {
            handleClose();
          }}
          onSubmit={(event) => {
            const formData = new FormData(event.currentTarget);
            dialog.resolve(Object.fromEntries(formData));
            handleClose();
          }}
        />
      );

    case "custom":
    default:
      return (
        <CustomDialog
          isOpen={isOpen}
          {...props}
          onClose={() => {
            handleClose();
          }}
        />
      );
  }
};
