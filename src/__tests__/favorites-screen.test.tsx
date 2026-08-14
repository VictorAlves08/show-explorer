import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import type { FavoriteShow } from '@/features/favorites/domain/favorite';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import type { ShowListItem } from '@/features/shows/domain/show';

import FavoritesScreen from '../app/(tabs)/favorites';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/features/favorites/hooks/useFavorites', () => ({
  useFavorites: jest.fn(),
}));

jest.mock('@/features/shows/components/ShowList', () => {
  const { Pressable, Text, View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  type MockShowListProps = {
    shows: readonly ShowListItem[];
    onShowPress?: (show: ShowListItem) => void;
    ListEmptyComponent?: ReactNode;
    renderShowAction?: (show: ShowListItem) => ReactNode;
  };

  function ShowList({
    shows,
    onShowPress,
    ListEmptyComponent,
    renderShowAction,
  }: MockShowListProps) {
    return (
      <View>
        {shows.length === 0 ? ListEmptyComponent : null}
        {shows.map((show) => (
          <View key={show.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open details for ${show.name}`}
              onPress={() => onShowPress?.(show)}
            >
              <Text>{show.name}</Text>
              <Text>{show.status}</Text>
              <Text>{show.rating === null ? 'unrated' : String(show.rating)}</Text>
            </Pressable>
            {renderShowAction?.(show)}
          </View>
        ))}
      </View>
    );
  }

  return { ShowList };
});

const mockPush = jest.mocked(router.push);
const mockUseFavorites = jest.mocked(useFavorites);

const breakingBad: FavoriteShow = {
  id: 1,
  name: 'Breaking Bad',
  imageUrl: null,
  status: 'ended',
  rating: 9.5,
  genres: [],
};

const runningShow: FavoriteShow = {
  id: 2,
  name: 'Running Show',
  imageUrl: null,
  status: 'running',
  rating: 8,
  genres: [],
};

const tbdShow: FavoriteShow = {
  id: 3,
  name: 'Future Show',
  imageUrl: null,
  status: 'to-be-determined',
  rating: 6.2,
  genres: [],
};

let currentFavorites: FavoriteShow[] = [];

function mockFavoritesState(isHydrated = true) {
  mockUseFavorites.mockImplementation(() => ({
    favorites: currentFavorites,
    isHydrated,
    isFavorite: (id: number) => currentFavorites.some((favorite) => favorite.id === id),
    addFavorite: jest.fn<() => Promise<void>>(),
    removeFavorite: jest.fn<() => Promise<void>>(),
    toggleFavorite: jest.fn(async (show: FavoriteShow) => {
      currentFavorites = currentFavorites.some((favorite) => favorite.id === show.id)
        ? currentFavorites.filter((favorite) => favorite.id !== show.id)
        : [...currentFavorites, show];
    }),
  }));
}

describe('FavoritesScreen', () => {
  beforeEach(() => {
    currentFavorites = [];
    mockPush.mockReset();
    mockUseFavorites.mockReset();
    mockFavoritesState();
  });

  it('shows hydration loading without rendering the empty onboarding state', async () => {
    mockFavoritesState(false);

    await render(<FavoritesScreen />);

    expect(screen.getByLabelText('Loading shows')).toBeTruthy();
    expect(screen.queryByText('No favorites yet')).toBeNull();
  });

  it('shows the onboarding empty state when no favorites exist', async () => {
    await render(<FavoritesScreen />);

    expect(screen.getByText('No favorites yet')).toBeTruthy();
    expect(screen.getByText('To Be Determined')).toBeTruthy();
    expect(screen.queryByText('Your saved shows, searchable offline.')).toBeNull();
  });

  it('renders favorites after hydration and navigates to normal show detail', async () => {
    currentFavorites = [breakingBad, runningShow];
    mockFavoritesState();

    await render(<FavoritesScreen />);

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('Running Show')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Open details for Running Show'));

    expect(mockPush).toHaveBeenCalledWith('/shows/2');
  });

  it('filters favorites by local search', async () => {
    currentFavorites = [breakingBad, runningShow];
    mockFavoritesState();

    await render(<FavoritesScreen />);

    await fireEvent.changeText(screen.getByLabelText('Search shows'), ' breaking ');

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.queryByText('Running Show')).toBeNull();
  });

  it('filters favorites by status, rating, and combined filters', async () => {
    currentFavorites = [breakingBad, runningShow, tbdShow];
    mockFavoritesState();

    await render(<FavoritesScreen />);

    await fireEvent.press(screen.getByLabelText('Status Running'));

    expect(screen.getByText('Running Show')).toBeTruthy();
    expect(screen.queryByText('Breaking Bad')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Status All'));
    await fireEvent.press(screen.getByLabelText('Rating 9 or higher'));

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.queryByText('Running Show')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Status To Be Determined'));

    expect(screen.getByText('No favorites match these filters')).toBeTruthy();
  });

  it('uses a distinct empty state when filters hide existing favorites', async () => {
    currentFavorites = [runningShow];
    mockFavoritesState();

    await render(<FavoritesScreen />);

    await fireEvent.changeText(screen.getByLabelText('Search shows'), 'missing');

    expect(screen.getByText('No favorites match these filters')).toBeTruthy();
    expect(screen.queryByText('No favorites yet')).toBeNull();
  });

  it('removes a visible favorite through the favorite action', async () => {
    currentFavorites = [breakingBad];
    mockFavoritesState();

    const { rerender } = await render(<FavoritesScreen />);

    await fireEvent.press(screen.getByLabelText('Remove Breaking Bad from favorites'));
    await rerender(<FavoritesScreen />);

    expect(screen.queryByText('Breaking Bad')).toBeNull();
    expect(screen.getByText('No favorites yet')).toBeTruthy();
  });
});
