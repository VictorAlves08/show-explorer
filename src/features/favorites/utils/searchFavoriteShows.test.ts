import { describe, expect, it } from '@jest/globals';

import type { FavoriteShow } from '../domain/favorite';
import { searchFavoriteShows } from './searchFavoriteShows';

const favorites: FavoriteShow[] = [
  {
    id: 1,
    name: 'Breaking Bad',
    imageUrl: null,
    status: 'ended',
    rating: 9.5,
    genres: [],
  },
  {
    id: 2,
    name: 'Better Things',
    imageUrl: null,
    status: 'ended',
    rating: 7.8,
    genres: [],
  },
];

describe('searchFavoriteShows', () => {
  it('returns all favorites for an empty search', () => {
    expect(searchFavoriteShows(favorites, '   ')).toEqual(favorites);
  });

  it('matches names case-insensitively after trimming', () => {
    expect(searchFavoriteShows(favorites, ' breaking ')).toEqual([favorites[0]]);
  });

  it('does not mutate the input collection', () => {
    const input = [...favorites];

    searchFavoriteShows(input, 'better');

    expect(input).toEqual(favorites);
  });
});
