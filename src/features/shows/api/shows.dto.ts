export type TvMazeImageDto = {
  medium?: string | null;
  original?: string | null;
} | null;

export type TvMazeRatingDto = {
  average?: number | null;
} | null;

export type TvMazeShowDto = {
  id: number;
  name: string;
  status?: string | null;
  genres?: string[] | null;
  summary?: string | null;
  premiered?: string | null;
  rating?: TvMazeRatingDto;
  image?: TvMazeImageDto;
};

export type TvMazeSearchResultDto = {
  score: number;
  show: TvMazeShowDto;
};

export type TvMazeEpisodeDto = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  runtime: number | null;
  airdate: string | null;
  summary: string | null;
};
