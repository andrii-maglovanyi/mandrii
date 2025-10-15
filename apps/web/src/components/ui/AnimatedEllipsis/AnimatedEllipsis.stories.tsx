import { Meta, StoryObj } from "@storybook/nextjs";

import { AnimatedEllipsis } from "./AnimatedEllipsis";

const meta: Meta<typeof AnimatedEllipsis> = {
  args: {
    centered: false,
    el: "\u2022",
    size: "sm",
  },
  argTypes: {
    centered: {
      control: "boolean",
      description: "Whether to center the ellipsis and take full space",
    },
    el: {
      control: "text",
      description: "The character/element to animate",
    },
    size: {
      control: "radio",
      description: "Size of the animated ellipsis",
      options: ["sm", "md", "lg"],
    },
  },
  component: AnimatedEllipsis,
  title: "ui/AnimatedEllipsis",
};

export default meta;
type Story = StoryObj<typeof AnimatedEllipsis>;

export const Default: Story = {
  args: {
    centered: false,
    el: "\u2022",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    el: "\u2022",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    el: "\u2022",
    size: "lg",
  },
};

export const LoadingDots: Story = {
  args: {
    el: ".",
    size: "lg",
  },
};

export const Hearts: Story = {
  args: {
    el: "♥",
    size: "md",
  },
};

export const Centered: Story = {
  args: {
    centered: true,
    el: "\u2022",
    size: "lg",
  },
};
