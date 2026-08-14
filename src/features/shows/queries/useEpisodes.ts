import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/apiError';

import { showsApi } from '../api/shows.api';
import { showKeys } from './show.keys';

function retryUnlessNotFound(failureCount: number, error: Error) {
  if (error instanceof ApiError && error.status === 404) {
    return false;
  }

  return failureCount < 2;
}

export function useEpisodes(showId: number) {
  return useQuery({
    queryKey: showKeys.episodes(showId),
    queryFn: () => showsApi.getEpisodes(showId),
    retry: retryUnlessNotFound,
  });
}
