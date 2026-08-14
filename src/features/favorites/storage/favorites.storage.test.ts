import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import type { FavoriteShow } from '../domain/favorite';
import { favoritesStorage } from './favorites.storage';
import { storage } from '@/lib/storage/storage';

jest.mock('@/lib/storage/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const storageMock = jest.mocked(storage);

const favorite: FavoriteShow = {
  id: 1,
  name: 'Breaking Bad',
  imageUrl: 'https://example.com/breaking-bad.jpg',
  status: 'ended',
  rating: 9.5,
  genres: ['Drama'],
};

describe('favoritesStorage', () => {
  beforeEach(() => {
    storageMock.getItem.mockReset();
    storageMock.setItem.mockReset();
  });

  it('returns an empty collection when nothing is stored', async () => {
    storageMock.getItem.mockResolvedValue(null);

    await expect(favoritesStorage.readFavorites()).resolves.toEqual([]);
  });

  it('returns stored favorite snapshots', async () => {
    storageMock.getItem.mockResolvedValue([favorite]);

    await expect(favoritesStorage.readFavorites()).resolves.toEqual([favorite]);
  });

  it('filters invalid stored values at the storage boundary', async () => {
    storageMock.getItem.mockResolvedValue([favorite, { id: 'bad' }]);

    await expect(favoritesStorage.readFavorites()).resolves.toEqual([favorite]);
  });

  it('writes the complete favorite collection', async () => {
    storageMock.setItem.mockResolvedValue(undefined);

    await favoritesStorage.writeFavorites([favorite]);

    expect(storageMock.setItem).toHaveBeenCalledWith('show-explorer:favorites', [favorite]);
  });

  it('propagates read failures', async () => {
    const error = new Error('storage failed');
    storageMock.getItem.mockRejectedValue(error);

    await expect(favoritesStorage.readFavorites()).rejects.toThrow(error);
  });
});
