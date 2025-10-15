import type { Meta, StoryFn, StoryObj } from "@storybook/nextjs";

import { useState } from "react";

import { Select, SelectProps } from "./Select";

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

const meta: Meta<typeof Select> = {
  argTypes: {
    disabled: { control: "boolean" },
    error: { control: "text" },
    label: { control: "text", defaultValue: "Fruit" },
    required: { control: "boolean" },
  },
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Select",
};

export default meta;
type Story = StoryObj<SelectProps<string, string>>;

const Template: StoryFn<SelectProps<string, string>> = (args) => {
  const [value, setValue] = useState("");

  return (
    <div className="w-full min-w-md">
      <Select {...args} onChange={(e) => setValue(e.target.value)} value={value} />
      <div className="mt-2">
        Selected value is... <strong>{value}</strong>
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {
    label: "Fruit",
    options,
  },
  render: Template,
};

export const Required: Story = {
  args: {
    label: "Select required",
    options,
    required: true,
  },
  render: Template,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled",
    options,
  },
  render: Template,
};

export const WithError: Story = {
  args: {
    error: "Please select a fruit",
    label: "With error",
    options,
  },
  render: Template,
};

export const NoLabel: Story = {
  args: {
    options,
  },
  render: Template,
};

const PreFilledTemplate: StoryFn<SelectProps<string, string>> = (args) => {
  const [value, setValue] = useState("banana");
  return (
    <div className="w-full min-w-md">
      <Select {...args} onChange={(e) => setValue(e.target.value)} value={value} />
      <div className="mt-2">
        Selected value is... <strong>{value}</strong>
      </div>
    </div>
  );
};

export const PreFilled: Story = {
  args: {
    label: "Pre-filled",
    options,
  },
  render: PreFilledTemplate,
};
