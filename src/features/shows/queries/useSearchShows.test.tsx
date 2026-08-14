import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';

import { showsApi } from '../api/shows.api';
import type { Show } from '../domain/show';
import { createQueryClientWrapper } from './queryTestUtils';
import { useSearchShows } from './useSearchShows';

jest.mock('../api/shows.api', () => ({
  showsApi: {
    search: jest.fn(),
  },
}));

const searchMock = jest.mocked(showsApi.search);

const show: Show = {
  id: 1,
  name: 'Girls',
  imageUrl: null,
  status: 'ended',
  rating: null,
  genres: [],
  summary: null,
  premieredAt: null,
};

describe('useSearchShows', () => {
  beforeEach(() => {
    searchMock.mockReset();
  });

  it('does not execute remote search for whitespace-only input', async () => {
    const { result } = await renderHook(() => useSearchShows('   '), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('normalizes the query for the query key and request', async () => {
    searchMock.mockResolvedValueOnce([show]);

    const { result } = await renderHook(() => useSearchShows('  girls  '), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(searchMock).toHaveBeenCalledWith('girls');
    expect(result.current.data).toEqual([show]);
  });
});
