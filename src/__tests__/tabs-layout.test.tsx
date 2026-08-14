import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useFavorites } from '@/features/favorites/hooks/useFavorites';

import TabsLayout from '../app/(tabs)/_layout';

type MockTabIconProps = {
  color: string;
  focused: boolean;
  size: number;
};

type MockTabOptions = {
  tabBarAccessibilityLabel?: string;
  tabBarBadge?: number;
  tabBarIcon?: (props: MockTabIconProps) => ReactNode;
  tabBarLabel?: string;
  title?: string;
};

type MockTabsComponent = {
  ({ children }: { children: ReactNode }): ReactNode;
  Screen: ({ name, options }: { name: string; options: MockTabOptions }) => ReactNode;
};

jest.mock('@/features/favorites/hooks/useFavorites', () => ({
  useFavorites: jest.fn(),
}));

jest.mock('expo-router', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Text, View } = jest.requireActual<typeof import('react-native')>('react-native');

  const Tabs: MockTabsComponent = ({ children }) => <View>{children}</View>;

  function MockTabsScreen({ name, options }: { name: string; options: MockTabOptions }) {
    return (
      <View accessibilityLabel={`${name} route`}>
        <Text>{options.tabBarLabel}</Text>
        <Text>{options.tabBarAccessibilityLabel}</Text>
        {options.tabBarBadge === undefined ? null : <Text>{String(options.tabBarBadge)}</Text>}
        {options.tabBarIcon?.({ color: '#2563eb', focused: false, size: 20 })}
      </View>
    );
  }

  Tabs.Screen = MockTabsScreen;

  return { Tabs };
});

const mockUseFavorites = jest.mocked(useFavorites);

describe('TabsLayout', () => {
  beforeEach(() => {
    mockUseFavorites.mockReset();
  });

  it('renders Home and Favorites tab labels without a zero badge', async () => {
    mockUseFavorites.mockReturnValue({
      favorites: [],
      isHydrated: true,
      isFavorite: jest.fn(() => false),
      addFavorite: jest.fn<() => Promise<void>>(),
      removeFavorite: jest.fn<() => Promise<void>>(),
      toggleFavorite: jest.fn<() => Promise<void>>(),
    });

    await render(<TabsLayout />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Favorites')).toBeTruthy();
    expect(screen.getByText('Home tab')).toBeTruthy();
    expect(screen.getByText('Favorites tab')).toBeTruthy();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('derives a visible Favorites tab badge from the favorites collection', async () => {
    mockUseFavorites.mockReturnValue({
      favorites: [
        {
          genres: [],
          id: 1,
          imageUrl: null,
          name: 'Breaking Bad',
          rating: 9.5,
          status: 'ended',
        },
        {
          genres: [],
          id: 2,
          imageUrl: null,
          name: 'Running Show',
          rating: 8,
          status: 'running',
        },
      ],
      isHydrated: true,
      isFavorite: jest.fn(() => false),
      addFavorite: jest.fn<() => Promise<void>>(),
      removeFavorite: jest.fn<() => Promise<void>>(),
      toggleFavorite: jest.fn<() => Promise<void>>(),
    });

    await render(<TabsLayout />);

    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('Favorites tab, 2 saved')).toBeTruthy();
  });
});
