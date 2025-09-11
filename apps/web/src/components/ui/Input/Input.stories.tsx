import type { Meta, StoryFn, StoryObj } from "@storybook/nextjs";

import { useState } from "react";

import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  argTypes: {
    disabled: {
      control: "boolean",
    },
    label: {
      control: "text",
      defaultValue: "Label",
    },
    placeholder: {
      control: "text",
      defaultValue: "Enter value...",
    },
    required: {
      control: "boolean",
    },
    type: {
      control: "text",
      defaultValue: "text",
    },
  },
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Input",
};

export default meta;
type Story = StoryObj<typeof Input>;

const Template: StoryFn<typeof Input> = (args) => {
  const [value, setValue] = useState("");

  return (
    <div className="w-full min-w-md">
      <Input {...args} onChange={(e) => setValue(e.target.value)} onSelectSuggestion={setValue} value={value} />
      <div className="mt-2">
        The value is... <strong>{value}</strong>
      </div>
    </div>
  );
};

// Default state
export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
  },
  render: Template,
};

// Required input
export const Required: Story = {
  args: {
    label: "Username",
    placeholder: "Choose a username",
    required: true,
  },
  render: Template,
};

// Disabled input
export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Disabled",
    placeholder: "Can't type here",
  },
  render: Template,
};

// Input with no label
export const NoLabel: Story = {
  args: {
    placeholder: "Just a field with no label",
  },
  render: Template,
};

// Input with password type
export const Password: Story = {
  args: {
    label: "Password",
    placeholder: "••••••••",
    type: "password",
  },
  render: Template,
};

// Input with an error message
export const WithError: Story = {
  args: {
    error: "Invalid email address",
    label: "Email",
    placeholder: "you@example.com",
  },
  render: Template,
};

export const WithSuggestions: Story = {
  args: {
    label: "Country",
    placeholder: "Start typing...",
    suggestions: [
      "United Kingdom",
      "The Netherlands",
      "Ukraine",
      "United States",
      "Uganda ",
      "Poland",
      "Germany",
      "Japan",
      "Spain",
      "France",
      "Italy",
    ],
  },
  render: Template,
};
