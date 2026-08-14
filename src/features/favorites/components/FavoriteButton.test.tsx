import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { FavoriteShow } from '../domain/favorite';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import { favoritesStorage } from '../storage/favorites.storage';
import { FavoriteButton } from './FavoriteButton';
import { FavoritesBadge } from './FavoritesBadge';

jest.mock('../storage/favorites.storage', () => ({
  favoritesStorage: {
    readFavorites: jest.fn(),
    writeFavorites: jest.fn(),
  },
}));

const storageMock = jest.mocked(favoritesStorage);

const show: FavoriteShow = {
  id: 1,
  name: 'Breaking Bad',
  imageUrl: null,
  status: 'ended',
  rating: 9.5,
  genres: [],
};

describe('FavoriteButton', () => {
  beforeEach(() => {
    storageMock.readFavorites.mockReset();
    storageMock.writeFavorites.mockReset();
    storageMock.readFavorites.mockResolvedValue([]);
    storageMock.writeFavorites.mockResolvedValue(undefined);
  });

  it('renders an unselected state and toggles into selected state', async () => {
    await render(
      <FavoritesProvider>
        <FavoriteButton show={show} />
      </FavoritesProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Add Breaking Bad to favorites')).toBeTruthy(),
    );

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add Breaking Bad to favorites'));
    });

    expect(screen.getByLabelText('Remove Breaking Bad from favorites')).toBeTruthy();
  });

  it('renders a selected state from hydrated favorites and toggles removal', async () => {
    storageMock.readFavorites.mockResolvedValue([show]);

    await render(
      <FavoritesProvider>
        <FavoriteButton show={show} />
      </FavoritesProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Remove Breaking Bad from favorites')).toBeTruthy(),
    );

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Remove Breaking Bad from favorites'));
    });

    expect(screen.getByLabelText('Add Breaking Bad to favorites')).toBeTruthy();
  });

  it('synchronizes multiple consumers through the provider', async () => {
    await render(
      <FavoritesProvider>
        <FavoriteButton show={show} />
        <FavoritesBadge />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByText('0')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add Breaking Bad to favorites'));
    });

    expect(screen.getByText('1')).toBeTruthy();
  });
});
