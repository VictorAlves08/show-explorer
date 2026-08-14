import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import type { FavoriteShow } from '../domain/favorite';
import { useFavorites } from '../hooks/useFavorites';
import { FavoritesProvider } from './FavoritesProvider';
import { favoritesStorage } from '../storage/favorites.storage';

jest.mock('../storage/favorites.storage', () => ({
  favoritesStorage: {
    readFavorites: jest.fn(),
    writeFavorites: jest.fn(),
  },
}));

const storageMock = jest.mocked(favoritesStorage);

const breakingBad: FavoriteShow = {
  id: 1,
  name: 'Breaking Bad',
  imageUrl: null,
  status: 'ended',
  rating: 9.5,
  genres: ['Drama'],
};

const runningShow: FavoriteShow = {
  id: 2,
  name: 'Running Show',
  imageUrl: null,
  status: 'running',
  rating: 8,
  genres: [],
};

function Harness() {
  const { favorites, isHydrated, isFavorite, addFavorite, removeFavorite, toggleFavorite } =
    useFavorites();

  return (
    <View>
      <Text>{isHydrated ? 'hydrated' : 'hydrating'}</Text>
      <Text>{`count:${favorites.length}`}</Text>
      <Text>{isFavorite(breakingBad.id) ? 'breaking-favorite' : 'breaking-not-favorite'}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add"
        onPress={() => void addFavorite(breakingBad)}
      >
        <Text>Add</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add duplicate"
        onPress={() => void addFavorite(breakingBad)}
      >
        <Text>Add duplicate</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove"
        onPress={() => void removeFavorite(breakingBad.id)}
      >
        <Text>Remove</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Toggle breaking"
        onPress={() => void toggleFavorite(breakingBad)}
      >
        <Text>Toggle breaking</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Toggle running"
        onPress={() => void toggleFavorite(runningShow)}
      >
        <Text>Toggle running</Text>
      </Pressable>
    </View>
  );
}

describe('FavoritesProvider', () => {
  beforeEach(() => {
    storageMock.readFavorites.mockReset();
    storageMock.writeFavorites.mockReset();
    storageMock.readFavorites.mockResolvedValue([]);
    storageMock.writeFavorites.mockResolvedValue(undefined);
  });

  it('hydrates persisted favorites and marks hydration complete', async () => {
    storageMock.readFavorites.mockResolvedValue([breakingBad]);

    await render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByText('hydrated')).toBeTruthy());

    expect(screen.getByText('count:1')).toBeTruthy();
    expect(screen.getByText('breaking-favorite')).toBeTruthy();
  });

  it('adds favorites, prevents duplicates, removes favorites, and persists changes', async () => {
    await render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByText('hydrated')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add'));
    });

    expect(screen.getByText('count:1')).toBeTruthy();
    expect(storageMock.writeFavorites).toHaveBeenLastCalledWith([breakingBad]);

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add duplicate'));
    });

    expect(screen.getByText('count:1')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Remove'));
    });

    expect(screen.getByText('count:0')).toBeTruthy();
    expect(storageMock.writeFavorites).toHaveBeenLastCalledWith([]);
  });

  it('toggles favorites semantically', async () => {
    await render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByText('hydrated')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Toggle running'));
    });

    expect(screen.getByText('count:1')).toBeTruthy();
    expect(storageMock.writeFavorites).toHaveBeenLastCalledWith([runningShow]);

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Toggle running'));
    });

    expect(screen.getByText('count:0')).toBeTruthy();
  });

  it('rolls back optimistic state if persistence fails', async () => {
    storageMock.writeFavorites.mockRejectedValue(new Error('write failed'));

    await render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByText('hydrated')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add'));
    });

    await waitFor(() => expect(screen.getByText('count:0')).toBeTruthy());
  });

  it('keeps the app usable when hydration fails', async () => {
    storageMock.readFavorites.mockRejectedValue(new Error('read failed'));

    await render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByText('hydrated')).toBeTruthy());
    expect(screen.getByText('count:0')).toBeTruthy();
  });
});
