import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { FavoritesBadge } from '@/features/favorites/components/FavoritesBadge';
import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { searchFavoriteShows } from '@/features/favorites/utils/searchFavoriteShows';
import { ShowFilters } from '@/features/shows/components/ShowFilters';
import { ShowList } from '@/features/shows/components/ShowList';
import { ShowListSkeleton } from '@/features/shows/components/ShowListSkeleton';
import type { ShowListItem } from '@/features/shows/domain/show';
import type { MinimumRating, StatusFilter } from '@/features/shows/domain/showFilters';
import { filterShows } from '@/features/shows/utils/filterShows';

export default function FavoritesScreen() {
  const { favorites, isHydrated } = useFavorites();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [minimumRating, setMinimumRating] = useState<MinimumRating>(null);

  const searchedFavorites = useMemo(
    () => searchFavoriteShows(favorites, search),
    [favorites, search],
  );
  const visibleFavorites = useMemo(
    () => filterShows(searchedFavorites, { status, minimumRating }),
    [minimumRating, searchedFavorites, status],
  );

  const handleShowPress = (show: ShowListItem) => {
    router.push(`/shows/${show.id}`);
  };

  return (
    <Screen>
      <View className="border-b border-border bg-background px-md pb-md pt-lg">
        <View className="mb-md flex-row items-start justify-between gap-md">
          <View className="min-w-0 flex-1 gap-xs">
            <Text variant="heading">Favorites</Text>
            <Text variant="muted">Your saved shows, searchable offline.</Text>
          </View>
          <FavoritesBadge />
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

      {!isHydrated ? (
        <View className="flex-1 px-md py-md">
          <ShowListSkeleton />
        </View>
      ) : (
        <ShowList
          shows={visibleFavorites}
          ListEmptyComponent={
            favorites.length === 0 ? (
              <EmptyState
                description="Add shows with the favorite button, then they will appear here."
                title="No favorites yet"
              />
            ) : (
              <EmptyState
                description="Try changing the search, status, or rating filters."
                title="No favorites match these filters"
              />
            )
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          onShowPress={handleShowPress}
          renderShowAction={(show) => <FavoriteButton show={show} />}
        />
      )}
    </Screen>
  );
}
