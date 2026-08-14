import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import type { ShowListItem } from '@/features/shows/domain/show';
import { useSearchShows } from '@/features/shows/queries/useSearchShows';
import { useShows } from '@/features/shows/queries/useShows';

import HomeScreen from '../app/index';

const mockFetchNextPage = jest.fn();
const mockBrowseRefetch = jest.fn();
const mockSearchRefetch = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/features/shows/queries/useShows', () => ({
  useShows: jest.fn(),
}));

jest.mock('@/features/shows/queries/useSearchShows', () => ({
  useSearchShows: jest.fn(),
}));

jest.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: <TValue,>(value: TValue) => value,
}));

jest.mock('@/features/shows/components/ShowList', () => {
  const { Pressable, Text, View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  type MockShowListProps = {
    shows: readonly ShowListItem[];
    onShowPress?: (show: ShowListItem) => void;
    onEndReached?: () => void;
    ListEmptyComponent?: ReactNode;
    ListFooterComponent?: ReactNode;
  };

  function ShowList({
    shows,
    onShowPress,
    onEndReached,
    ListEmptyComponent,
    ListFooterComponent,
  }: MockShowListProps) {
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End reached"
          onPress={onEndReached}
        >
          <Text>End reached</Text>
        </Pressable>
        {shows.length === 0 ? ListEmptyComponent : null}
        {shows.map((show) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open details for ${show.name}`}
            key={show.id}
            onPress={() => onShowPress?.(show)}
          >
            <Text>{show.name}</Text>
          </Pressable>
        ))}
        {ListFooterComponent}
      </View>
    );
  }

  return { ShowList };
});

const runningShow: ShowListItem = {
  id: 1,
  name: 'Running Show',
  imageUrl: null,
  status: 'running',
  rating: 8,
  genres: [],
};

const endedShow: ShowListItem = {
  id: 2,
  name: 'Ended Show',
  imageUrl: null,
  status: 'ended',
  rating: 7,
  genres: [],
};

const searchResult: ShowListItem = {
  id: 3,
  name: 'Girls',
  imageUrl: null,
  status: 'ended',
  rating: 8.4,
  genres: [],
};

const mockPush = jest.mocked(router.push);
const mockUseShows = jest.mocked(useShows);
const mockUseSearchShows = jest.mocked(useSearchShows);
type BrowseQueryResult = ReturnType<typeof useShows>;
type SearchQueryResult = ReturnType<typeof useSearchShows>;

function createBrowseQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [[runningShow, endedShow]] },
    fetchNextPage: mockFetchNextPage,
    hasNextPage: true,
    isError: false,
    isFetchingNextPage: false,
    isPending: false,
    refetch: mockBrowseRefetch,
    ...overrides,
  } as unknown as BrowseQueryResult;
}

function createSearchQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: [],
    isError: false,
    isPending: false,
    refetch: mockSearchRefetch,
    ...overrides,
  } as unknown as SearchQueryResult;
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockFetchNextPage.mockReset();
    mockBrowseRefetch.mockReset();
    mockSearchRefetch.mockReset();
    mockPush.mockReset();
    mockUseShows.mockReset();
    mockUseSearchShows.mockReset();
    mockUseShows.mockReturnValue(createBrowseQuery());
    mockUseSearchShows.mockReturnValue(createSearchQuery());
  });

  it('renders initial browse loading as show skeletons', async () => {
    mockUseShows.mockReturnValue(
      createBrowseQuery({
        data: undefined,
        isPending: true,
      }),
    );

    await render(<HomeScreen />);

    expect(screen.getByLabelText('Loading shows')).toBeTruthy();
  });

  it('renders browse results', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('Running Show')).toBeTruthy();
    expect(screen.getByText('Ended Show')).toBeTruthy();
  });

  it('normalizes input and switches to remote search mode', async () => {
    mockUseSearchShows.mockImplementation((query: unknown) =>
      query === 'Girls' ? createSearchQuery({ data: [searchResult] }) : createSearchQuery(),
    );

    await render(<HomeScreen />);

    await fireEvent.changeText(screen.getByLabelText('Search shows'), ' Girls ');

    expect(screen.getByText('Girls')).toBeTruthy();
    expect(screen.queryByText('Running Show')).toBeNull();
    expect(mockUseSearchShows).toHaveBeenLastCalledWith('Girls');
  });

  it('filters visible items without changing the remote dataset', async () => {
    await render(<HomeScreen />);

    await fireEvent.press(screen.getByLabelText('Status Ended'));

    expect(screen.queryByText('Running Show')).toBeNull();
    expect(screen.getByText('Ended Show')).toBeTruthy();
  });

  it('renders distinct search and filter empty states', async () => {
    mockUseSearchShows.mockImplementation((query: unknown) =>
      query === 'Missing' ? createSearchQuery({ data: [] }) : createSearchQuery(),
    );

    const { rerender } = await render(<HomeScreen />);

    await fireEvent.changeText(screen.getByLabelText('Search shows'), 'Missing');

    expect(screen.getByText('No search results')).toBeTruthy();

    mockUseSearchShows.mockReturnValue(createSearchQuery({ data: [searchResult] }));
    await rerender(<HomeScreen />);

    await fireEvent.press(screen.getByLabelText('Rating 9 or higher'));

    expect(screen.getByText('No shows match these filters')).toBeTruthy();
  });

  it('retries initial browse errors', async () => {
    mockUseShows.mockReturnValue(
      createBrowseQuery({
        data: undefined,
        isError: true,
      }),
    );

    await render(<HomeScreen />);

    await fireEvent.press(screen.getByText('Try again'));

    expect(mockBrowseRefetch).toHaveBeenCalledTimes(1);
  });

  it('navigates to show details on show press', async () => {
    await render(<HomeScreen />);

    await fireEvent.press(screen.getByLabelText('Open details for Ended Show'));

    expect(mockPush).toHaveBeenCalledWith('/shows/2');
  });

  it('fetches another page only in browse mode', async () => {
    mockUseSearchShows.mockImplementation((query: unknown) =>
      query === 'Girls' ? createSearchQuery({ data: [searchResult] }) : createSearchQuery(),
    );

    await render(<HomeScreen />);

    await fireEvent.press(screen.getByLabelText('End reached'));

    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);

    await fireEvent.changeText(screen.getByLabelText('Search shows'), 'Girls');

    await fireEvent.press(screen.getByLabelText('End reached'));

    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });
});
