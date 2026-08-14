import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/lib/api/apiError';

import { showsApi } from '../api/shows.api';
import type { Episode } from '../domain/episode';
import type { Show } from '../domain/show';
import { showKeys } from './show.keys';
import { createTestQueryClient, createQueryClientWrapper } from './queryTestUtils';
import { useEpisodes } from './useEpisodes';
import { useShow } from './useShow';

jest.mock('../api/shows.api', () => ({
  showsApi: {
    getById: jest.fn(),
    getEpisodes: jest.fn(),
  },
}));

const getByIdMock = jest.mocked(showsApi.getById);
const getEpisodesMock = jest.mocked(showsApi.getEpisodes);

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

const episode: Episode = {
  id: 10,
  name: 'Pilot',
  season: 1,
  number: 1,
  runtime: 42,
  airdate: '2013-06-24',
  summary: null,
};

describe('useShow and useEpisodes', () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    getEpisodesMock.mockReset();
  });

  it('loads show detail and episodes as distinct cache resources', async () => {
    getByIdMock.mockResolvedValueOnce(show);
    getEpisodesMock.mockResolvedValueOnce([episode]);

    const queryClient = createTestQueryClient();
    const wrapper = createQueryClientWrapper(queryClient);

    const showHook = await renderHook(() => useShow(1), { wrapper });
    const episodesHook = await renderHook(() => useEpisodes(1), { wrapper });

    await waitFor(() => expect(showHook.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(episodesHook.result.current.isSuccess).toBe(true));

    expect(getByIdMock).toHaveBeenCalledWith(1);
    expect(getEpisodesMock).toHaveBeenCalledWith(1);
    expect(queryClient.getQueryData(showKeys.detail(1))).toEqual(show);
    expect(queryClient.getQueryData(showKeys.episodes(1))).toEqual([episode]);
  });

  it('does not retry permanent detail or episode 404 responses', async () => {
    getByIdMock.mockRejectedValueOnce(new ApiError('Show not found', 404));
    getEpisodesMock.mockRejectedValueOnce(new ApiError('Episodes not found', 404));

    const wrapper = createQueryClientWrapper();

    const showHook = await renderHook(() => useShow(404), { wrapper });
    const episodesHook = await renderHook(() => useEpisodes(404), { wrapper });

    await waitFor(() => expect(showHook.result.current.isError).toBe(true));
    await waitFor(() => expect(episodesHook.result.current.isError).toBe(true));

    expect(getByIdMock).toHaveBeenCalledTimes(1);
    expect(getEpisodesMock).toHaveBeenCalledTimes(1);
  });
});
