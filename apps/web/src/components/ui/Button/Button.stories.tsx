import { Meta, StoryObj } from "@storybook/nextjs";

import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  args: {
    children: "Click Me",
    color: "primary",
    disabled: false,
    size: "md",
    type: "button",
    variant: "filled",
  },
  argTypes: {
    children: {
      control: "text",
    },
    color: {
      control: "radio",
      options: ["primary", "neutral"],
    },
    onClick: { action: "clicked" },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    type: {
      control: "radio",
      options: ["button", "submit", "reset"],
    },
    variant: {
      control: "radio",
      options: ["filled", "outlined", "ghost"],
    },
  },
  component: Button,
  title: "ui/Button",
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    color: "primary",
    variant: "filled",
  },
};

export const Neutral: Story = {
  args: {
    children: "Neutral Button",
    color: "neutral",
    variant: "filled",
  },
};

export const Outlined: Story = {
  args: {
    children: "Outlined Button",
    color: "primary",
    variant: "outlined",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost Button",
    color: "primary",
    variant: "ghost",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium Button",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    children: "Small Button",
    size: "sm",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
