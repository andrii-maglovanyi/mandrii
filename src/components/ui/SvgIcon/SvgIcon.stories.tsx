import type { Meta, StoryObj } from "@storybook/nextjs";

import { SvgIcon, svgImportKeys } from "./SvgIcon";

const meta: Meta<typeof SvgIcon> = {
  args: {
    id: "youtube",
    size: "medium",
  },
  argTypes: {
    id: {
      control: { type: "select" },
      options: svgImportKeys,
    },
    size: {
      control: { type: "radio" },
      options: ["small", "medium", "large"],
    },
  },
  component: SvgIcon,
  tags: ["autodocs"],
  title: "UI/SvgIcon",
};

export default meta;
type Story = StoryObj<typeof SvgIcon>;

export const Default: Story = {};

export const AllIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      {svgImportKeys.map((icon) => (
        <div className="flex flex-col items-center text-xs" key={icon}>
          <SvgIcon {...args} id={icon} />
          <span>{icon}</span>
        </div>
      ))}
    </div>
  ),
};
