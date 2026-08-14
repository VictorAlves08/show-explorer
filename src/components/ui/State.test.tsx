import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

describe('EmptyState', () => {
  it('renders content and optional action', async () => {
    const onPress = jest.fn();

    await render(
      <EmptyState
        title="Nothing here"
        description="Try another option."
        action={<Button onPress={onPress}>Reset</Button>}
      />,
    );

    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Try another option.')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Reset' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorState', () => {
  it('renders content and optional retry', async () => {
    const onRetry = jest.fn();

    await render(
      <ErrorState title="Could not load" description="Try again soon." onRetry={onRetry} />,
    );

    expect(screen.getByText('Could not load')).toBeTruthy();
    expect(screen.getByText('Try again soon.')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
