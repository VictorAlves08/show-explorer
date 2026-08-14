import type { ShowListItem } from '../domain/show';
import type { ShowFiltersValue } from '../domain/showFilters';

export function filterShows<TShow extends ShowListItem>(
  shows: readonly TShow[],
  filters: ShowFiltersValue,
): TShow[] {
  return shows.filter((show) => {
    const matchesStatus = filters.status === 'all' || show.status === filters.status;
    const matchesRating =
      filters.minimumRating === null ||
      (show.rating !== null && show.rating >= filters.minimumRating);

    return matchesStatus && matchesRating;
  });
}
