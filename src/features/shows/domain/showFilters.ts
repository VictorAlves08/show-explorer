export type StatusFilter = 'all' | 'running' | 'ended' | 'to-be-determined';

export type MinimumRating = null | 6 | 7 | 8 | 9;

export type ShowFiltersValue = {
  status: StatusFilter;
  minimumRating: MinimumRating;
};
