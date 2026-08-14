import type { FavoriteShow } from '@/features/favorites/domain/favorite';
import type { ShowStatus } from '@/features/shows/domain/show';
import { storage } from '@/lib/storage/storage';

const FAVORITES_STORAGE_KEY = 'show-explorer:favorites';

export const favoritesStorage = {
  async readFavorites(): Promise<FavoriteShow[]> {
    const storedFavorites = await storage.getItem<unknown>(FAVORITES_STORAGE_KEY);

    if (!Array.isArray(storedFavorites)) {
      return [];
    }

    return storedFavorites.filter(isFavoriteShow);
  },

  async writeFavorites(favorites: readonly FavoriteShow[]): Promise<void> {
    await storage.setItem(FAVORITES_STORAGE_KEY, favorites);
  },
};

function isFavoriteShow(value: unknown): value is FavoriteShow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    (typeof value.imageUrl === 'string' || value.imageUrl === null) &&
    isShowStatus(value.status) &&
    (typeof value.rating === 'number' || value.rating === null) &&
    Array.isArray(value.genres) &&
    value.genres.every((genre) => typeof genre === 'string')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isShowStatus(value: unknown): value is ShowStatus {
  return (
    value === 'running' || value === 'ended' || value === 'to-be-determined' || value === 'unknown'
  );
}
