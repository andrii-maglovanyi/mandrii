import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Switch, type SwitchProps } from "./Switch";

const meta: Meta<typeof Switch> = {
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "radio", options: ["sm", "md"] },
  },
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "UI/Switch",
};

export default meta;
type Story = StoryObj<typeof Switch>;

const Controlled = (args: SwitchProps) => {
  const [checked, setChecked] = useState(Boolean(args.checked));
  return <Switch {...args} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
};

export const Default: Story = {
  args: { label: "Email alerts" },
  render: Controlled,
};

export const WithDescription: Story = {
  args: { description: "Receive alerts in your inbox.", label: "Email alerts" },
  render: Controlled,
};

export const Enabled: Story = {
  args: { checked: true, description: "Receive alerts in this browser.", label: "Browser alerts" },
  render: Controlled,
};

export const Disabled: Story = {
  args: { checked: false, description: "Connect Telegram to turn this on.", disabled: true, label: "Telegram" },
  render: Controlled,
};

export const Small: Story = {
  args: { label: "Compact switch", size: "sm" },
  render: Controlled,
};
