export const showKeys = {
  all: ['shows'] as const,
  lists: () => [...showKeys.all, 'list'] as const,
  browse: () => [...showKeys.lists(), 'browse'] as const,
  searches: () => [...showKeys.all, 'search'] as const,
  search: (query: string) => [...showKeys.searches(), query] as const,
  details: () => [...showKeys.all, 'detail'] as const,
  detail: (id: number) => [...showKeys.details(), id] as const,
  episodes: (id: number) => [...showKeys.detail(id), 'episodes'] as const,
};
