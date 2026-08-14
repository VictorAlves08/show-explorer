import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Episode } from '@/features/shows/domain/episode';
import type { Show } from '@/features/shows/domain/show';
import { useEpisodes } from '@/features/shows/queries/useEpisodes';
import { useShow } from '@/features/shows/queries/useShow';

import ShowDetailScreen, { normalizeShowIdParam } from '../app/shows/[id]';

const mockUseLocalSearchParams = jest.fn();
const mockRefetchShow = jest.fn();
const mockRefetchEpisodes = jest.fn();

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Image: View,
  };
});

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

    return <Text>Favorite action</Text>;
  },
}));

jest.mock('@/features/shows/queries/useShow', () => ({
  useShow: jest.fn(),
}));

jest.mock('@/features/shows/queries/useEpisodes', () => ({
  useEpisodes: jest.fn(),
}));

const show: Show = {
  id: 1,
  name: 'Breaking Bad',
  imageUrl: null,
  status: 'ended',
  rating: 9.5,
  genres: ['Drama', 'Crime'],
  summary: '<p>A chemistry teacher becomes something else.</p>',
  premieredAt: '2008-01-20',
};

const episodes: Episode[] = [
  {
    id: 3,
    name: 'Season Two Start',
    season: 2,
    number: 1,
    runtime: 47,
    airdate: '2009-03-08',
    summary: null,
  },
  {
    id: 1,
    name: 'Pilot',
    season: 1,
    number: 1,
    runtime: 58,
    airdate: '2008-01-20',
    summary: null,
  },
  {
    id: 2,
    name: "Cat's in the Bag...",
    season: 1,
    number: 2,
    runtime: null,
    airdate: null,
    summary: null,
  },
];

const mockUseShow = jest.mocked(useShow);
const mockUseEpisodes = jest.mocked(useEpisodes);

type QueryMock<TData> = {
  data?: TData;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
};

function mockShowQuery(overrides: Partial<QueryMock<Show>> = {}) {
  mockUseShow.mockReturnValue({
    data: show,
    isPending: false,
    isError: false,
    refetch: mockRefetchShow,
    ...overrides,
  } as unknown as ReturnType<typeof useShow>);
}

function mockEpisodesQuery(overrides: Partial<QueryMock<Episode[]>> = {}) {
  mockUseEpisodes.mockReturnValue({
    data: episodes,
    isPending: false,
    isError: false,
    refetch: mockRefetchEpisodes,
    ...overrides,
  } as unknown as ReturnType<typeof useEpisodes>);
}

function renderWithId(id: string | string[] | undefined = '1') {
  mockUseLocalSearchParams.mockReturnValue({ id });
  return render(<ShowDetailScreen />);
}

describe('normalizeShowIdParam', () => {
  it('accepts positive integer route params', () => {
    expect(normalizeShowIdParam('42')).toBe(42);
  });

  it('rejects invalid route params', () => {
    expect(normalizeShowIdParam(undefined)).toBeNull();
    expect(normalizeShowIdParam('')).toBeNull();
    expect(normalizeShowIdParam('0')).toBeNull();
    expect(normalizeShowIdParam('-1')).toBeNull();
    expect(normalizeShowIdParam('1.5')).toBeNull();
    expect(normalizeShowIdParam(['1'])).toBeNull();
  });
});

describe('ShowDetailScreen', () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReset();
    mockRefetchShow.mockReset();
    mockRefetchEpisodes.mockReset();
    mockUseShow.mockReset();
    mockUseEpisodes.mockReset();
    mockShowQuery();
    mockEpisodesQuery();
  });

  it('renders a route-level fallback for invalid IDs without calling queries', async () => {
    await renderWithId('not-a-number');

    expect(screen.getByText('Show not found')).toBeTruthy();
    expect(mockUseShow).not.toHaveBeenCalled();
    expect(mockUseEpisodes).not.toHaveBeenCalled();
  });

  it('shows detail skeleton while required show data is loading', async () => {
    mockShowQuery({ data: undefined, isPending: true });

    await renderWithId();

    expect(screen.getByLabelText('Loading show detail')).toBeTruthy();
  });

  it('renders show detail, sanitized summary, favorite action, and grouped seasons', async () => {
    await renderWithId();

    expect(mockUseShow).toHaveBeenCalledWith(1);
    expect(mockUseEpisodes).toHaveBeenCalledWith(1);
    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('Ended')).toBeTruthy();
    expect(screen.getByText(/9.5/)).toBeTruthy();
    expect(screen.getByText('Drama / Crime')).toBeTruthy();
    expect(screen.getByText('Premiered 2008-01-20')).toBeTruthy();
    expect(screen.getByText('A chemistry teacher becomes something else.')).toBeTruthy();
    expect(screen.getByText('Favorite action')).toBeTruthy();
    expect(screen.getByText('Season 1')).toBeTruthy();
    expect(screen.getByText('Pilot')).toBeTruthy();
    expect(screen.getByText("Cat's in the Bag...")).toBeTruthy();
    expect(screen.getByText('Season 2')).toBeTruthy();
    expect(screen.queryByText('Season Two Start')).toBeNull();
  });

  it('does not render null or undefined copy for missing optional show fields', async () => {
    mockShowQuery({
      data: {
        ...show,
        imageUrl: null,
        rating: null,
        genres: [],
        summary: null,
        premieredAt: null,
      },
    });

    await renderWithId();

    expect(screen.queryByText('null')).toBeNull();
    expect(screen.queryByText('undefined')).toBeNull();
    expect(screen.getByText('Rating unavailable')).toBeTruthy();
  });

  it('retries show errors when show data is unavailable', async () => {
    mockShowQuery({ data: undefined, isError: true });

    await renderWithId();

    fireEvent.press(screen.getByText('Try again'));

    expect(mockRefetchShow).toHaveBeenCalledTimes(1);
  });

  it('keeps show information visible while episodes are loading', async () => {
    mockEpisodesQuery({ data: undefined, isPending: true });

    await renderWithId();

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByLabelText('Loading episodes')).toBeTruthy();
  });

  it('keeps show information visible and retries only episodes on episode failure', async () => {
    mockEpisodesQuery({ data: undefined, isError: true });

    await renderWithId();

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('Episodes did not load')).toBeTruthy();

    fireEvent.press(screen.getByText('Try again'));

    expect(mockRefetchEpisodes).toHaveBeenCalledTimes(1);
    expect(mockRefetchShow).not.toHaveBeenCalled();
  });

  it('renders an empty state for a successful empty episode list', async () => {
    mockEpisodesQuery({ data: [] });

    await renderWithId();

    expect(screen.getByText('No episodes available')).toBeTruthy();
  });
});
