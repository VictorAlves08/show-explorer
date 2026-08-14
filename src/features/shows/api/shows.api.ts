import { request } from '@/lib/api/httpClient';

import type { Episode } from '../domain/episode';
import type { Show } from '../domain/show';
import type { TvMazeEpisodeDto, TvMazeSearchResultDto, TvMazeShowDto } from './shows.dto';
import { mapEpisodeDto, mapSearchResultDto, mapShowDto } from './shows.mappers';

async function list(page: number): Promise<Show[]> {
  const shows = await request<TvMazeShowDto[]>(`/shows?page=${page}`);

  return shows.map(mapShowDto);
}

async function search(query: string): Promise<Show[]> {
  const searchParams = new URLSearchParams({ q: query });
  const results = await request<TvMazeSearchResultDto[]>(
    `/search/shows?${searchParams.toString()}`,
  );

  return results.map(mapSearchResultDto);
}

async function getById(id: number): Promise<Show> {
  const show = await request<TvMazeShowDto>(`/shows/${id}`);

  return mapShowDto(show);
}

async function getEpisodes(showId: number): Promise<Episode[]> {
  const episodes = await request<TvMazeEpisodeDto[]>(`/shows/${showId}/episodes`);

  return episodes.map(mapEpisodeDto);
}

export const showsApi = {
  list,
  search,
  getById,
  getEpisodes,
};
