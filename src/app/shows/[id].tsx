import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { SeasonAccordion } from '@/features/shows/components/SeasonAccordion';
import { ShowDetail } from '@/features/shows/components/ShowDetail';
import { ShowDetailSkeleton } from '@/features/shows/components/ShowDetailSkeleton';
import { useEpisodes } from '@/features/shows/queries/useEpisodes';
import { useShow } from '@/features/shows/queries/useShow';
import { groupEpisodesBySeason } from '@/features/shows/utils/groupEpisodesBySeason';
import { useOptionalSafeAreaInsets } from '@/hooks/useOptionalSafeAreaInsets';

export function normalizeShowIdParam(id: string | string[] | undefined): number | null {
  if (Array.isArray(id)) {
    return null;
  }

  if (id === undefined || id.trim().length === 0) {
    return null;
  }

  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export default function ShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const showId = normalizeShowIdParam(id);

  if (showId === null) {
    return (
      <Screen padded className="justify-center">
        <Stack.Screen options={{ title: 'Show Details' }} />
        <ErrorState description="This show link is not valid." title="Show not found" />
      </Screen>
    );
  }

  return <ValidShowDetailScreen showId={showId} />;
}

type ValidShowDetailScreenProps = {
  showId: number;
};

function ValidShowDetailScreen({ showId }: ValidShowDetailScreenProps) {
  const insets = useOptionalSafeAreaInsets();
  const showQuery = useShow(showId);
  const episodesQuery = useEpisodes(showId);
  const show = showQuery.data;

  const retryShow = () => {
    void showQuery.refetch();
  };

  if (showQuery.isPending && show === undefined) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Show Details' }} />
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 24 + insets.bottom,
            paddingHorizontal: 16,
            paddingTop: 24,
          }}
        >
          <ShowDetailSkeleton />
        </ScrollView>
      </Screen>
    );
  }

  if (showQuery.isError && show === undefined) {
    return (
      <Screen padded className="justify-center">
        <Stack.Screen options={{ title: 'Show Details' }} />
        <ErrorState
          description="We could not load this show. Please try again."
          onRetry={retryShow}
          title="Show did not load"
        />
      </Screen>
    );
  }

  if (show === undefined) {
    return (
      <Screen padded className="justify-center">
        <Stack.Screen options={{ title: 'Show Details' }} />
        <ErrorState
          description="This show is unavailable right now."
          onRetry={retryShow}
          title="Show did not load"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: show.name }} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24 + insets.bottom,
          paddingHorizontal: 16,
          paddingTop: 24,
        }}
      >
        <View className="gap-xl">
          <ShowDetail show={show} action={<FavoriteButton show={show} />} />
          <EpisodesSection
            episodes={episodesQuery.data}
            isError={episodesQuery.isError}
            isPending={episodesQuery.isPending}
            onRetry={() => {
              void episodesQuery.refetch();
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

type EpisodesSectionProps = {
  episodes: ReturnType<typeof useEpisodes>['data'];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
};

function EpisodesSection({ episodes, isPending, isError, onRetry }: EpisodesSectionProps) {
  const seasons = useMemo(
    () => (episodes === undefined ? [] : groupEpisodesBySeason(episodes)),
    [episodes],
  );

  return (
    <View className="gap-md">
      <Text variant="heading">Episodes</Text>

      {isPending && episodes === undefined ? (
        <EpisodesSkeleton />
      ) : isError ? (
        <ErrorState
          className="rounded-md border border-border bg-surface"
          description="Episode information did not load. Show details are still available."
          onRetry={onRetry}
          title="Episodes did not load"
        />
      ) : seasons.length === 0 ? (
        <EmptyState
          className="rounded-md border border-border bg-surface"
          description="No episodes were returned for this show."
          title="No episodes available"
        />
      ) : (
        <View className="gap-md">
          {seasons.map((season, index) => (
            <SeasonAccordion key={season.number} season={season} defaultExpanded={index === 0} />
          ))}
        </View>
      )}
    </View>
  );
}

function EpisodesSkeleton() {
  return (
    <View accessibilityLabel="Loading episodes" className="gap-md">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </View>
  );
}
