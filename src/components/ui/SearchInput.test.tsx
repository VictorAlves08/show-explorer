import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders value and placeholder', async () => {
    await render(<SearchInput value="lost" placeholder="Search shows" onChangeText={jest.fn()} />);

    expect(screen.getByDisplayValue('lost')).toBeTruthy();
    expect(screen.getByPlaceholderText('Search shows')).toBeTruthy();
  });

  it('invokes text-change callbacks', async () => {
    const onChangeText = jest.fn();

    await render(<SearchInput value="" placeholder="Search shows" onChangeText={onChangeText} />);

    fireEvent.changeText(screen.getByPlaceholderText('Search shows'), 'dark');

    expect(onChangeText).toHaveBeenCalledWith('dark');
  });
});
