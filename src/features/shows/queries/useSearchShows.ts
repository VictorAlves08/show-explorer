import { useQuery } from '@tanstack/react-query';

import { showsApi } from '../api/shows.api';
import { showKeys } from './show.keys';

export function useSearchShows(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: showKeys.search(normalizedQuery),
    queryFn: () => showsApi.search(normalizedQuery),
    enabled: normalizedQuery.length > 0,
  });
}
