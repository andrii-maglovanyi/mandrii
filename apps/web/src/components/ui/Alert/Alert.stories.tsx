import { Meta, StoryObj } from "@storybook/nextjs";

import { ColorVariant } from "~/types";

import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  argTypes: {
    children: {
      control: "text",
      defaultValue: "Something went wrong!",
    },
    variant: {
      control: "select",
      options: ["error", "warning", "info", "success"],
    },
  },
  component: Alert,
  tags: ["autodocs"],
  title: "UI/Alert",
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    children: "This is an alert",
    variant: ColorVariant.Error,
  },
};

export const Success: Story = {
  args: {
    children: "Operation completed successfully!",
    variant: ColorVariant.Success,
  },
};

export const Warning: Story = {
  args: {
    children: "Be careful, this might break things.",
    variant: ColorVariant.Warning,
  },
};

export const Info: Story = {
  args: {
    children: "Here is some useful information.",
    variant: ColorVariant.Info,
  },
};
