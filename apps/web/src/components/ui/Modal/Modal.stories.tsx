import type { Meta, StoryFn, StoryObj } from "@storybook/nextjs";

import { useState } from "react";

import { Button } from "../Button/Button";
import { Modal, type ModalProps } from "./Modal";

const meta: Meta<typeof Modal> = {
  argTypes: {
    children: {
      control: "text",
      defaultValue: "This is the modal content.",
    },
    title: {
      control: "text",
      defaultValue: "Modal Title",
    },
  },
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Modal",
};

export default meta;
type Story = StoryObj<typeof Modal>;

const Template: StoryFn<typeof Modal> = (args: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        I am a modal window
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: Template,
};
