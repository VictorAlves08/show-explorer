import { describe, expect, it } from '@jest/globals';

import type { Episode } from '@/features/shows/domain/episode';

import { groupEpisodesBySeason } from './groupEpisodesBySeason';

function episode(overrides: Partial<Episode>): Episode {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? 'Episode',
    season: overrides.season ?? 1,
    number: 'number' in overrides ? (overrides.number ?? null) : 1,
    runtime: overrides.runtime ?? null,
    airdate: overrides.airdate ?? null,
    summary: overrides.summary ?? null,
  };
}

describe('groupEpisodesBySeason', () => {
  it('groups episodes into ascending seasons', () => {
    const seasons = groupEpisodesBySeason([
      episode({ id: 3, season: 2, number: 1 }),
      episode({ id: 1, season: 0, number: 1 }),
      episode({ id: 2, season: 1, number: 1 }),
    ]);

    expect(seasons.map((season) => season.number)).toEqual([0, 1, 2]);
    expect(seasons[0]?.episodes.map((item) => item.id)).toEqual([1]);
  });

  it('orders numbered episodes and keeps null episode numbers stable at the end', () => {
    const untitledA = episode({ id: 3, season: 1, number: null, name: 'Special A' });
    const untitledB = episode({ id: 4, season: 1, number: null, name: 'Special B' });

    const seasons = groupEpisodesBySeason([
      episode({ id: 2, season: 1, number: 2 }),
      untitledA,
      episode({ id: 1, season: 1, number: 1 }),
      untitledB,
    ]);

    expect(seasons[0]?.episodes.map((item) => item.id)).toEqual([1, 2, 3, 4]);
  });

  it('does not mutate the source array', () => {
    const episodes = [
      episode({ id: 2, season: 2, number: 1 }),
      episode({ id: 1, season: 1, number: 1 }),
    ];
    const originalOrder = episodes.map((item) => item.id);

    groupEpisodesBySeason(episodes);

    expect(episodes.map((item) => item.id)).toEqual(originalOrder);
  });

  it('returns no seasons for empty input', () => {
    expect(groupEpisodesBySeason([])).toEqual([]);
  });
});
