import { View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';

export function ShowCardSkeleton() {
  return (
    <View
      accessibilityLabel="Loading show"
      className="flex-row gap-md rounded-md border border-border bg-surface p-sm"
    >
      <Skeleton className="aspect-[2/3] w-24 rounded-sm" />

      <View className="flex-1 justify-between gap-sm py-xs">
        <View className="gap-sm">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </View>

        <View className="gap-sm">
          <Skeleton className="h-7 w-28 rounded-sm" />
          <Skeleton className="h-4 w-20" />
        </View>
      </View>
    </View>
  );
}
