export type Episode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  runtime: number | null;
  airdate: string | null;
  summary: string | null;
};
