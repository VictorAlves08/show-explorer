import type { Episode } from '@/features/shows/domain/episode';
import type { Season } from '@/features/shows/domain/season';

function compareEpisodesByNumber(left: Episode, right: Episode) {
  if (left.number === null && right.number === null) {
    return 0;
  }

  if (left.number === null) {
    return 1;
  }

  if (right.number === null) {
    return -1;
  }

  return left.number - right.number;
}

export function groupEpisodesBySeason(episodes: readonly Episode[]): Season[] {
  const seasonsByNumber = new Map<number, Episode[]>();

  for (const episode of episodes) {
    const seasonEpisodes = seasonsByNumber.get(episode.season);

    if (seasonEpisodes) {
      seasonEpisodes.push(episode);
    } else {
      seasonsByNumber.set(episode.season, [episode]);
    }
  }

  return Array.from(seasonsByNumber.entries())
    .sort(([leftSeason], [rightSeason]) => leftSeason - rightSeason)
    .map(([number, seasonEpisodes]) => ({
      number,
      episodes: [...seasonEpisodes].sort(compareEpisodesByNumber),
    }));
}
