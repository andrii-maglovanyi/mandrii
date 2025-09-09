import { Meta, StoryObj } from "@storybook/nextjs";
import { useEffect, useState } from "react";

import { ProgressBar, ProgressBarProps } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  argTypes: {
    isLoading: {
      control: "boolean",
      defaultValue: true,
    },
    onLoaded: {
      action: "onLoaded",
    },
  },
  component: ProgressBar,
  tags: ["autodocs"],
  title: "UI/ProgressBar",
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    isLoading: true,
  },
};

const SimulatedLoadTemplate = (args: Readonly<ProgressBarProps>) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  return <ProgressBar {...args} isLoading={isLoading} />;
};

export const SimulatedLoad: Story = {
  render: SimulatedLoadTemplate,
};
