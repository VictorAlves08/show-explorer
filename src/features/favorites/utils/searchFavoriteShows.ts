import type { FavoriteShow } from '../domain/favorite';

export function searchFavoriteShows(
  favorites: readonly FavoriteShow[],
  query: string,
): FavoriteShow[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return [...favorites];
  }

  return favorites.filter((favorite) => favorite.name.toLowerCase().includes(normalizedQuery));
}
