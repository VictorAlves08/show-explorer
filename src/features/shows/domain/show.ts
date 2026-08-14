export type ShowStatus = 'running' | 'ended' | 'to-be-determined' | 'unknown';

export type Show = {
  id: number;
  name: string;
  imageUrl: string | null;
  status: ShowStatus;
  rating: number | null;
  genres: string[];
  summary: string | null;
  premieredAt: string | null;
};

export type ShowListItem = Pick<Show, 'id' | 'name' | 'imageUrl' | 'status' | 'rating' | 'genres'>;

export function normalizeShowStatus(status: string | null | undefined): ShowStatus {
  switch (status) {
    case 'Running':
      return 'running';
    case 'Ended':
      return 'ended';
    case 'To Be Determined':
      return 'to-be-determined';
    default:
      return 'unknown';
  }
}
