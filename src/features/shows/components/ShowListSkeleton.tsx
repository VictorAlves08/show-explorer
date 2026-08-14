import { View } from 'react-native';

import { ShowCardSkeleton } from './ShowCardSkeleton';

type ShowListSkeletonProps = {
  count?: number;
};

export function ShowListSkeleton({ count = 6 }: ShowListSkeletonProps) {
  return (
    <View accessibilityLabel="Loading shows" accessibilityRole="progressbar" className="gap-md">
      {Array.from({ length: count }, (_, index) => (
        <ShowCardSkeleton key={index} />
      ))}
    </View>
  );
}
