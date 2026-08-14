import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { cn } from './classNames';

type SkeletonProps = ViewProps & {
  className?: string;
};

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <View className={cn('overflow-hidden rounded-md bg-surface-muted', className)} {...props} />
  );
}
