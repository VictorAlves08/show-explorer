import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Chip } from './Chip';

describe('Chip', () => {
  it('invokes press callbacks', async () => {
    const onPress = jest.fn();

    await render(<Chip onPress={onPress}>Running</Chip>);

    fireEvent.press(screen.getByRole('button', { name: 'Running' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes selected accessibility state', async () => {
    await render(<Chip selected>Running</Chip>);

    expect(screen.getByRole('button', { selected: true, name: 'Running' })).toBeTruthy();
  });
});
