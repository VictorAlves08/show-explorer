import type { ShowListItem } from '@/features/shows/domain/show';

export type FavoriteShow = ShowListItem;

export function toFavoriteShow(show: ShowListItem): FavoriteShow {
  return {
    id: show.id,
    name: show.name,
    imageUrl: show.imageUrl,
    status: show.status,
    rating: show.rating,
    genres: [...show.genres],
  };
}
