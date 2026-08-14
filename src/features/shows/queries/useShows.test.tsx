import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/lib/api/apiError';

import { showsApi } from '../api/shows.api';
import type { Show } from '../domain/show';
import { createQueryClientWrapper } from './queryTestUtils';
import { useShows } from './useShows';

jest.mock('../api/shows.api', () => ({
  showsApi: {
    list: jest.fn(),
  },
}));

const listMock = jest.mocked(showsApi.list);

const show: Show = {
  id: 1,
  name: 'Under the Dome',
  imageUrl: null,
  status: 'running',
  rating: null,
  genres: [],
  summary: null,
  premieredAt: null,
};

describe('useShows', () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it('starts at page 0 and delegates subsequent page parameters', async () => {
    listMock.mockResolvedValueOnce([show]).mockResolvedValueOnce([{ ...show, id: 2 }]);

    const { result } = await renderHook(() => useShows(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(listMock).toHaveBeenCalledWith(0);

    const nextPageResult = await result.current.fetchNextPage();

    expect(listMock).toHaveBeenCalledWith(1);
    expect(nextPageResult.data?.pages).toEqual([[show], [{ ...show, id: 2 }]]);
  });

  it('treats browse 404 as a terminal empty page', async () => {
    listMock.mockResolvedValueOnce([show]).mockRejectedValueOnce(new ApiError('Not found', 404));

    const { result } = await renderHook(() => useShows(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const nextPageResult = await result.current.fetchNextPage();

    expect(nextPageResult.data?.pages).toEqual([[show], []]);
    expect(nextPageResult.hasNextPage).toBe(false);
    expect(nextPageResult.isError).toBe(false);
  });

  it('propagates non-404 browse errors', async () => {
    listMock.mockRejectedValueOnce(new ApiError('Server error', 500));

    const { result } = await renderHook(() => useShows(), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new ApiError('Server error', 500));
  });
});
