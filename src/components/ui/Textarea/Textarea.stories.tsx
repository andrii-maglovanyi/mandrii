import type { Meta, StoryFn, StoryObj } from "@storybook/nextjs";

import { useState } from "react";

import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  argTypes: {
    disabled: { control: "boolean" },
    error: { control: { type: "text" } },
    label: { control: "text", defaultValue: "Label" },
    maxChars: { control: { type: "number" } },
    placeholder: { control: "text", defaultValue: "Type your message..." },
    required: { control: "boolean" },
    rows: { control: { type: "number" }, defaultValue: 4 },
  },
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Textarea",
};

export default meta;
type Story = StoryObj<typeof Textarea>;

const Template: StoryFn<typeof Textarea> = (args) => {
  const [value, setValue] = useState("");

  return (
    <div className="w-md">
      <Textarea {...args} onChange={(e) => setValue(e.target.value)} value={value} />
    </div>
  );
};

export const Default: Story = {
  args: {
    label: "Message",
    placeholder: "Enter your message here...",
  },
  render: Template,
};

export const Required: Story = {
  args: {
    label: "Feedback",
    placeholder: "Required field",
    required: true,
  },
  render: Template,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Notes",
    placeholder: "Disabled field",
  },
  render: Template,
};

export const NoLabel: Story = {
  args: {
    placeholder: "No label, just text",
  },
  render: Template,
};

export const WithMaxChars: Story = {
  args: {
    label: "Bio",
    maxChars: 100,
    placeholder: "Max 100 characters",
  },
  render: Template,
};

export const WithError: Story = {
  args: {
    error: "This field is required",
    label: "Comment",
    placeholder: "Write something...",
  },
  render: Template,
};
