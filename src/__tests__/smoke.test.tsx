import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

function SmokeTestComponent() {
  return <Text>Show Explorer</Text>;
}

describe('testing environment', () => {
  it('renders a React Native component', async () => {
    await render(<SmokeTestComponent />);

    expect(screen.getByText('Show Explorer')).toBeTruthy();
  });
});
