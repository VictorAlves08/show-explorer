import { describe, expect, it } from '@jest/globals';

import type { TvMazeEpisodeDto, TvMazeShowDto } from './shows.dto';
import { mapEpisodeDto, mapSearchResultDto, mapShowDto } from './shows.mappers';

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

describe('mapShowDto', () => {
  it('maps show scalar fields and normalized values', () => {
    const dto = createShowDto();

    expect(mapShowDto(dto)).toEqual({
      id: 1,
      name: 'Under the Dome',
      imageUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/81/202627.jpg',
      status: 'running',
      rating: 6.5,
      genres: ['Drama', 'Science-Fiction'],
      summary: '<p>A town is trapped under a dome.</p>',
      premieredAt: '2013-06-24',
    });
  });

  it('copies genres instead of sharing the DTO array', () => {
    const genres = ['Drama', 'Mystery'];
    const dto = createShowDto({ genres });
    const show = mapShowDto(dto);

    expect(show.genres).toEqual(genres);
    expect(show.genres).not.toBe(genres);
  });

  it('falls back to the medium image when original is unavailable', () => {
    const show = mapShowDto(
      createShowDto({
        image: {
          medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/1/1.jpg',
          original: null,
        },
      }),
    );

    expect(show.imageUrl).toBe('https://static.tvmaze.com/uploads/images/medium_portrait/1/1.jpg');
  });

  it('maps missing image to null', () => {
    expect(mapShowDto(createShowDto({ image: null })).imageUrl).toBeNull();
    expect(mapShowDto(createShowDto({ image: undefined })).imageUrl).toBeNull();
  });

  it('preserves missing optional values as null', () => {
    const show = mapShowDto(
      createShowDto({
        rating: {
          average: null,
        },
        summary: null,
        premiered: null,
      }),
    );

    expect(show.rating).toBeNull();
    expect(show.summary).toBeNull();
    expect(show.premieredAt).toBeNull();
  });

  it('uses defensive defaults for absent nullable transport fields', () => {
    const show = mapShowDto(
      createShowDto({
        genres: undefined,
        rating: undefined,
        summary: undefined,
        premiered: undefined,
        status: undefined,
      }),
    );

    expect(show.genres).toEqual([]);
    expect(show.rating).toBeNull();
    expect(show.summary).toBeNull();
    expect(show.premieredAt).toBeNull();
    expect(show.status).toBe('unknown');
  });
});

describe('mapSearchResultDto', () => {
  it('maps the wrapped show through the show mapper semantics', () => {
    const show = mapSearchResultDto({
      score: 0.9,
      show: createShowDto({
        id: 2,
        status: 'Ended',
        image: {
          medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/2/2.jpg',
          original: null,
        },
      }),
    });

    expect(show).toEqual(
      expect.objectContaining({
        id: 2,
        status: 'ended',
        imageUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/2/2.jpg',
      }),
    );
  });
});

describe('mapEpisodeDto', () => {
  it('maps episode fields', () => {
    const dto: TvMazeEpisodeDto = {
      id: 10,
      name: 'Pilot',
      season: 1,
      number: 1,
      runtime: 42,
      airdate: '2013-06-24',
      summary: '<p>The dome appears.</p>',
    };

    expect(mapEpisodeDto(dto)).toEqual({
      id: 10,
      name: 'Pilot',
      season: 1,
      number: 1,
      runtime: 42,
      airdate: '2013-06-24',
      summary: '<p>The dome appears.</p>',
    });
  });

  it('preserves nullable episode fields', () => {
    const dto: TvMazeEpisodeDto = {
      id: 11,
      name: 'Special',
      season: 1,
      number: null,
      runtime: null,
      airdate: null,
      summary: null,
    };

    expect(mapEpisodeDto(dto)).toEqual({
      id: 11,
      name: 'Special',
      season: 1,
      number: null,
      runtime: null,
      airdate: null,
      summary: null,
    });
  });
});
