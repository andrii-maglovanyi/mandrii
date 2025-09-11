import { Modal, ModalProps } from "~/components/ui/Modal/Modal";

export type CustomProps = Pick<ModalProps, "children" | "title">;

export const CustomDialog = ({ children, ...props }: ModalProps) => {
  return <Modal {...props}>{children}</Modal>;
};
