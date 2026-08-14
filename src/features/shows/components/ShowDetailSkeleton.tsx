import { View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';

export function ShowDetailSkeleton() {
  return (
    <View accessibilityLabel="Loading show detail" className="gap-lg">
      <Skeleton className="aspect-[2/3] w-full rounded-md" />
      <View className="gap-sm">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-2/3" />
      </View>
      <View className="gap-sm">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </View>
      <View className="gap-md">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-14 w-full" />
      </View>
    </View>
  );
}
