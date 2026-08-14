import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { ShowFilters } from '@/features/shows/components/ShowFilters';
import { ShowCardSkeleton } from '@/features/shows/components/ShowCardSkeleton';
import { ShowList } from '@/features/shows/components/ShowList';
import { ShowListSkeleton } from '@/features/shows/components/ShowListSkeleton';
import type { ShowListItem } from '@/features/shows/domain/show';
import type { MinimumRating, StatusFilter } from '@/features/shows/domain/showFilters';
import { useSearchShows } from '@/features/shows/queries/useSearchShows';
import { useShows } from '@/features/shows/queries/useShows';
import { filterShows } from '@/features/shows/utils/filterShows';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const SEARCH_DEBOUNCE_MS = 350;

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [minimumRating, setMinimumRating] = useState<MinimumRating>(null);

  const normalizedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(normalizedSearch, SEARCH_DEBOUNCE_MS);
  const mode = debouncedSearch.length > 0 ? 'search' : 'browse';

  const browseQuery = useShows();
  const searchQuery = useSearchShows(debouncedSearch);

  const browsedShows = useMemo(
    () => browseQuery.data?.pages.flat() ?? [],
    [browseQuery.data?.pages],
  );

  const availableShows = useMemo(
    () => (mode === 'browse' ? browsedShows : (searchQuery.data ?? [])),
    [browsedShows, mode, searchQuery.data],
  );
  const visibleShows = useMemo(
    () => filterShows(availableShows, { status, minimumRating }),
    [availableShows, minimumRating, status],
  );

  const isInitialBrowseLoading =
    mode === 'browse' && browseQuery.isPending && browsedShows.length === 0;
  const isSearchLoading = mode === 'search' && searchQuery.isPending;
  const isInitialBrowseError =
    mode === 'browse' && browseQuery.isError && browsedShows.length === 0;
  const isSearchError = mode === 'search' && searchQuery.isError;

  const handleEndReached = () => {
    if (mode !== 'browse' || !browseQuery.hasNextPage || browseQuery.isFetchingNextPage) {
      return;
    }

    void browseQuery.fetchNextPage();
  };

  const handleShowPress = (show: ShowListItem) => {
    router.push(`/shows/${show.id}`);
  };

  const retryInitialBrowse = () => {
    void browseQuery.refetch();
  };

  const retrySearch = () => {
    void searchQuery.refetch();
  };

  return (
    <Screen>
      <View className="border-b border-border bg-background px-md pb-md pt-lg">
        <View className="mb-md gap-xs">
          <Text variant="heading">Shows</Text>
          <Text variant="muted">Browse, search, and refine TV shows.</Text>
        </View>

        <ShowFilters
          minimumRating={minimumRating}
          onMinimumRatingChange={setMinimumRating}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          search={search}
          status={status}
        />
      </View>

      {isInitialBrowseLoading || isSearchLoading ? (
        <View className="flex-1 px-md py-md">
          <ShowListSkeleton />
        </View>
      ) : isInitialBrowseError ? (
        <ErrorState
          className="flex-1 justify-center"
          description="We could not load the show catalog. Please try again."
          onRetry={retryInitialBrowse}
          title="Shows did not load"
        />
      ) : isSearchError ? (
        <ErrorState
          className="flex-1 justify-center"
          description="We could not complete that search. Please try again."
          onRetry={retrySearch}
          title="Search failed"
        />
      ) : (
        <ShowList
          shows={visibleShows}
          ListEmptyComponent={
            <HomeEmptyState
              availableCount={availableShows.length}
              mode={mode}
              search={debouncedSearch}
            />
          }
          ListFooterComponent={
            <HomeListFooter
              isFetchingNextPage={mode === 'browse' && browseQuery.isFetchingNextPage}
              paginationFailed={mode === 'browse' && browseQuery.isError && browsedShows.length > 0}
              onRetryPagination={() => {
                void browseQuery.fetchNextPage();
              }}
            />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          onShowPress={handleShowPress}
        />
      )}
    </Screen>
  );
}

type DiscoveryMode = 'browse' | 'search';

type HomeEmptyStateProps = {
  mode: DiscoveryMode;
  search: string;
  availableCount: number;
};

function HomeEmptyState({ mode, search, availableCount }: HomeEmptyStateProps) {
  if (availableCount > 0) {
    return (
      <EmptyState
        description="Try a different status or rating."
        title="No shows match these filters"
      />
    );
  }

  if (mode === 'search') {
    return <EmptyState description={`No shows matched "${search}".`} title="No search results" />;
  }

  return (
    <EmptyState description="The catalog did not return any shows." title="No shows available" />
  );
}

type HomeListFooterProps = {
  isFetchingNextPage: boolean;
  paginationFailed: boolean;
  onRetryPagination: () => void;
};

function HomeListFooter({
  isFetchingNextPage,
  paginationFailed,
  onRetryPagination,
}: HomeListFooterProps) {
  if (isFetchingNextPage) {
    return (
      <View className="mt-md gap-md">
        <ShowCardSkeleton />
        <ShowCardSkeleton />
      </View>
    );
  }

  if (paginationFailed) {
    return (
      <ErrorState
        className="py-lg"
        description="The next page did not load. Existing shows are still available."
        onRetry={onRetryPagination}
        title="Could not load more shows"
      />
    );
  }

  return null;
}
