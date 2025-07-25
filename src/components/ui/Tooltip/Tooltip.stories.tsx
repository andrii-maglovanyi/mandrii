import type { Meta, StoryFn, StoryObj } from "@storybook/nextjs";

import { Tooltip } from "./Tooltip";

const positions = [
  "top",
  "top-start",
  "top-end",
  "right",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
] as const;

const meta: Meta<typeof Tooltip> = {
  argTypes: {
    label: {
      control: "text",
      defaultValue: "Tooltip text",
    },
    position: {
      control: { type: "select" },
      defaultValue: "top",
      options: positions,
    },
  },
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Tooltip",
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

const Template: StoryFn<typeof Tooltip> = (args) => (
  <Tooltip {...args}>
    <span
      className={`
        inline-block cursor-default rounded bg-surface px-3 py-2 transition
        hover:bg-surface-tint
      `}
    >
      Hover me
    </span>
  </Tooltip>
);

export const Top: Story = {
  args: {
    label: "I'm top",
    position: "top",
  },
  render: Template,
};

export const TopStart: Story = {
  args: {
    label: "I'm top-start",
    position: "top-start",
  },
  render: Template,
};

export const TopEnd: Story = {
  args: {
    label: "I'm top-end",
    position: "top-end",
  },
  render: Template,
};

export const Right: Story = {
  args: {
    label: "I'm right",
    position: "right",
  },
  render: Template,
};

export const Bottom: Story = {
  args: {
    label: "I'm bottom",
    position: "bottom",
  },
  render: Template,
};

export const BottomStart: Story = {
  args: {
    label: "I'm bottom-start",
    position: "bottom-start",
  },
  render: Template,
};

export const BottomEnd: Story = {
  args: {
    label: "I'm bottom-end",
    position: "bottom-end",
  },
  render: Template,
};

export const Left: Story = {
  args: {
    label: "I'm left",
    position: "left",
  },
  render: Template,
};
