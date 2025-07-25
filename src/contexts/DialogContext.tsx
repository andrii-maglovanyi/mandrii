"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import { ConfirmProps } from "~/components/layout/DialogHost/ConfirmDialog";
import { CustomProps } from "~/components/layout/DialogHost/CustomDialog";
import { DialogHost } from "~/components/layout/DialogHost/DialogHost";
import { FormProps } from "~/components/layout/DialogHost/FormDialog";

export type DialogEntry =
  | {
      props: ConfirmProps;
      resolve: (value: boolean) => void;
      type: "confirm";
    }
  | { props: CustomProps; type: "custom" }
  | {
      props: FormProps;
      resolve: (value: Record<string, FormDataEntryValue>) => void;
      type: "form";
    };

interface DialogContextType {
  closeDialog: () => void;
  dialog: DialogEntry | null;
  openConfirmDialog: (props: ConfirmProps) => Promise<boolean>;
  openCustomDialog: (props: CustomProps) => Promise<void>;
  openFormDialog: (
    props: FormProps,
  ) => Promise<Record<string, FormDataEntryValue>>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => useContext(DialogContext)!;

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<DialogEntry | null>(null);

  const openConfirmDialog = (props: ConfirmProps): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setDialog({ props, resolve, type: "confirm" });
    });
  };

  const openCustomDialog = (props: CustomProps): Promise<void> => {
    return new Promise<void>(() => {
      setDialog({ props, type: "custom" });
    });
  };

  const openFormDialog = (
    props: FormProps,
  ): Promise<Record<string, FormDataEntryValue>> => {
    return new Promise((resolve) => {
      setDialog({ props, resolve, type: "form" });
    });
  };

  const closeDialog = () => {
    setDialog(null);
  };

  const value = useMemo(
    () => ({
      closeDialog,
      dialog,
      openConfirmDialog,
      openCustomDialog,
      openFormDialog,
    }),
    [dialog],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}

      <DialogHost dialog={dialog} />
    </DialogContext.Provider>
  );
};
