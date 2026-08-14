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

export function useShow(id: number) {
  return useQuery({
    queryKey: showKeys.detail(id),
    queryFn: () => showsApi.getById(id),
    retry: retryUnlessNotFound,
  });
}
