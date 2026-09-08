import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "../Checkbox/Checkbox";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  title: "ui/Dropdown",
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const AlertPreferences: Story = {
  args: {
    "aria-label": "Manage alerts",
    children: (
      <fieldset className="space-y-3">
        <legend className="text-neutral mb-3 text-xs font-semibold tracking-wide uppercase">Alerts</legend>
        <Checkbox checked label="Venue updates" onChange={() => undefined} size="sm" />
        <Checkbox checked label="New events" onChange={() => undefined} size="sm" />
      </fieldset>
    ),
    label: "Manage alerts",
  },
};
