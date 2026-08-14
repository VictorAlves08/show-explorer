import type { Episode } from '@/features/shows/domain/episode';

export type Season = {
  number: number;
  episodes: Episode[];
};
