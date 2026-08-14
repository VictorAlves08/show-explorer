import type { Episode } from '@/features/shows/domain/episode';
import type { Show } from '@/features/shows/domain/show';
import { normalizeShowStatus } from '@/features/shows/domain/show';

import type { TvMazeEpisodeDto, TvMazeSearchResultDto, TvMazeShowDto } from './shows.dto';

function mapShowImageUrl(dto: TvMazeShowDto): string | null {
  return dto.image?.original ?? dto.image?.medium ?? null;
}

export function mapShowDto(dto: TvMazeShowDto): Show {
  return {
    id: dto.id,
    name: dto.name,
    imageUrl: mapShowImageUrl(dto),
    status: normalizeShowStatus(dto.status),
    rating: dto.rating?.average ?? null,
    genres: dto.genres === undefined || dto.genres === null ? [] : [...dto.genres],
    summary: dto.summary ?? null,
    premieredAt: dto.premiered ?? null,
  };
}

export function mapSearchResultDto(dto: TvMazeSearchResultDto): Show {
  return mapShowDto(dto.show);
}

export function mapEpisodeDto(dto: TvMazeEpisodeDto): Episode {
  return {
    id: dto.id,
    name: dto.name,
    season: dto.season,
    number: dto.number,
    runtime: dto.runtime,
    airdate: dto.airdate,
    summary: dto.summary,
  };
}
