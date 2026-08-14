import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { request } from '@/lib/api/httpClient';

import type { TvMazeEpisodeDto, TvMazeShowDto } from './shows.dto';
import { showsApi } from './shows.api';

jest.mock('@/lib/api/httpClient', () => ({
  request: jest.fn(),
}));

const requestMock = jest.mocked(request);

function createShowDto(overrides: Partial<TvMazeShowDto> = {}): TvMazeShowDto {
  return {
    id: 1,
    name: 'Under the Dome',
    status: 'Running',
    genres: ['Drama', 'Science-Fiction'],
    summary: '<p>A town is trapped under a dome.</p>',
    premiered: '2013-06-24',
    rating: {
      average: 6.5,
    },
    image: {
      medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/81/202627.jpg',
      original: 'https://static.tvmaze.com/uploads/images/original_untouched/81/202627.jpg',
    },
    ...overrides,
  };
}

function createEpisodeDto(overrides: Partial<TvMazeEpisodeDto> = {}): TvMazeEpisodeDto {
  return {
    id: 10,
    name: 'Pilot',
    season: 1,
    number: 1,
    runtime: 42,
    airdate: '2013-06-24',
    summary: '<p>The dome appears.</p>',
    ...overrides,
  };
}

describe('showsApi', () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  describe('list', () => {
    it('requests the zero-based browse page and returns normalized shows', async () => {
      requestMock.mockResolvedValueOnce([createShowDto()]);

      await expect(showsApi.list(0)).resolves.toEqual([
        {
          id: 1,
          name: 'Under the Dome',
          imageUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/81/202627.jpg',
          status: 'running',
          rating: 6.5,
          genres: ['Drama', 'Science-Fiction'],
          summary: '<p>A town is trapped under a dome.</p>',
          premieredAt: '2013-06-24',
        },
      ]);

      expect(requestMock).toHaveBeenCalledWith('/shows?page=0');
    });

    it('passes the requested browse page without inferring pagination state', async () => {
      requestMock.mockResolvedValueOnce([]);

      await expect(showsApi.list(2)).resolves.toEqual([]);

      expect(requestMock).toHaveBeenCalledWith('/shows?page=2');
    });
  });

  describe('search', () => {
    it('requests the search endpoint and normalizes wrapped search results', async () => {
      requestMock.mockResolvedValueOnce([
        {
          score: 0.9,
          show: createShowDto({ id: 2, status: 'Ended' }),
        },
      ]);

      await expect(showsApi.search('girls')).resolves.toEqual([
        expect.objectContaining({
          id: 2,
          status: 'ended',
        }),
      ]);

      expect(requestMock).toHaveBeenCalledWith('/search/shows?q=girls');
    });

    it('encodes search query parameters safely', async () => {
      requestMock.mockResolvedValueOnce([]);

      await showsApi.search('game of thrones');

      const [path] = requestMock.mock.calls[0] ?? [];
      if (typeof path !== 'string') {
        throw new Error('Expected request to be called with a path string');
      }

      const url = new URL(path, 'https://api.tvmaze.com');
      expect(url.pathname).toBe('/search/shows');
      expect(url.searchParams.get('q')).toBe('game of thrones');
    });
  });

  describe('getById', () => {
    it('requests show detail independently and returns a normalized show', async () => {
      requestMock.mockResolvedValueOnce(createShowDto({ id: 42, name: 'The Expanse' }));

      await expect(showsApi.getById(42)).resolves.toEqual(
        expect.objectContaining({
          id: 42,
          name: 'The Expanse',
          status: 'running',
        }),
      );

      expect(requestMock).toHaveBeenCalledWith('/shows/42');
    });
  });

  describe('getEpisodes', () => {
    it('requests show episodes without specials and returns normalized episodes', async () => {
      requestMock.mockResolvedValueOnce([createEpisodeDto({ id: 42 })]);

      await expect(showsApi.getEpisodes(42)).resolves.toEqual([
        {
          id: 42,
          name: 'Pilot',
          season: 1,
          number: 1,
          runtime: 42,
          airdate: '2013-06-24',
          summary: '<p>The dome appears.</p>',
        },
      ]);

      expect(requestMock).toHaveBeenCalledWith('/shows/42/episodes');
      expect(requestMock).not.toHaveBeenCalledWith(expect.stringContaining('specials'));
    });
  });
});
