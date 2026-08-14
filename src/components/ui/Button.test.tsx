import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  it('renders content and exposes button semantics', async () => {
    await render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('invokes press callbacks', async () => {
    const onPress = jest.fn();

    await render(<Button onPress={onPress}>Save</Button>);

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke press callbacks when disabled', async () => {
    const onPress = jest.fn();

    await render(
      <Button disabled onPress={onPress}>
        Save
      </Button>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
