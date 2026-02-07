import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import TagInput from './TagInput';

const meta: Meta<typeof TagInput> = {
  title: 'Draft/TagInput',
  component: TagInput,
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Interactive: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <TagInput
        label="Attributes"
        name="attributes"
        values={values}
        options={['Cultural', 'Scientific']}
        onAdd={(value) => setValues((prev) => [...prev, value])}
        onRemove={(value) => setValues((prev) => prev.filter((entry) => entry !== value))}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'Cultural{enter}');
    await expect(canvas.getByText('Cultural')).toBeInTheDocument();
  },
};
