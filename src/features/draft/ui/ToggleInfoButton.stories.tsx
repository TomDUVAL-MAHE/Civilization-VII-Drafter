import type { Meta, StoryObj } from '@storybook/react';
import ToggleInfoButton from './ToggleInfoButton';

const meta: Meta<typeof ToggleInfoButton> = {
  title: 'Draft/ToggleInfoButton',
  component: ToggleInfoButton,
  args: { title: 'Toggle', tooltip: 'More info', onToggle: () => {} },
};

export default meta;
type Story = StoryObj<typeof ToggleInfoButton>;

export const Unpressed: Story = { args: { pressed: false } };
export const Pressed: Story = { args: { pressed: true } };
export const Disabled: Story = { args: { pressed: false, disabled: true } };
