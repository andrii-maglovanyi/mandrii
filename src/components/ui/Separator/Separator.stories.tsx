import type { Meta, StoryFn, StoryObj } from "@storybook/nextjs";

import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  argTypes: {
    className: {
      control: "text",
    },
    text: {
      control: "text",
      defaultValue: "OR",
    },
    variant: {
      control: { type: "select" },
      defaultValue: "full",
      options: ["full", "margin", "tight"],
    },
  },
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Separator",
};

export default meta;

type Story = StoryObj<typeof Separator>;

const Template: StoryFn<typeof Separator> = (args) => (
  <div className="w-md border-4 border-neutral-50">
    <Separator {...args} />
  </div>
);

export const Full: Story = {
  args: {
    text: "Full Width",
    variant: "full",
  },
  render: Template,
};

export const Margin: Story = {
  args: {
    text: "With Margin",
    variant: "margin",
  },
  render: Template,
};

export const Tight: Story = {
  args: {
    text: "Tightly Fit",
    variant: "tight",
  },
  render: Template,
};
