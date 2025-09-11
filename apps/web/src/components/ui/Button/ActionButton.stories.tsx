import { Meta, StoryObj } from "@storybook/nextjs";
import { Cloud, Moon, Sun } from "lucide-react"; // Or any icon library you're using
import React from "react";

import { ActionButton } from "./ActionButton";

const meta: Meta<typeof ActionButton> = {
  args: {
    "aria-label": "Example button",
    color: "primary",
    icon: <Sun />,
    size: "md",
  },
  argTypes: {
    color: {
      control: "radio",
      options: ["primary", "neutral"],
    },
    icon: {
      control: false, // icons are JSX, not controllable via string
    },
    onClick: { action: "clicked" },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "radio",
      options: ["filled", "outlined", "ghost"],
    },
  },
  component: ActionButton,
  title: "ui/ActionButton",
};

export default meta;

type Story = StoryObj<typeof ActionButton>;

export const Primary: Story = {
  args: {
    "aria-label": "Primary button",
    color: "primary",
    icon: <Moon />,
    variant: "filled",
  },
};

export const Neutral: Story = {
  args: {
    "aria-label": "Neutral button",
    color: "neutral",
    icon: <Moon />,
    variant: "filled",
  },
};

export const Outlined: Story = {
  args: {
    "aria-label": "Outlined button",
    icon: <Moon />,
    variant: "outlined",
  },
};

export const Ghost: Story = {
  args: {
    "aria-label": "Ghost button",
    icon: <Moon />,
    variant: "ghost",
  },
};

export const Large: Story = {
  args: {
    icon: <Sun />,
    size: "lg",
  },
};

export const Medium: Story = {
  args: {
    icon: <Sun />,
    size: "md",
  },
};

export const Small: Story = {
  args: {
    icon: <Sun />,
    size: "sm",
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Disabled button",
    disabled: true,
    icon: <Cloud />,
  },
};
