import { useInfiniteQuery } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/apiError';

import { showsApi } from '../api/shows.api';
import { showKeys } from './show.keys';

async function listShowsPage(page: number) {
  try {
    return await showsApi.list(page);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export function useShows() {
  return useInfiniteQuery({
    queryKey: showKeys.browse(),
    queryFn: ({ pageParam }) => listShowsPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) {
        return undefined;
      }

      return allPages.length;
    },
  });
}
