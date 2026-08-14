import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { cn } from './classNames';

type DividerProps = ViewProps & {
  className?: string;
};

export function Divider({ className, ...props }: DividerProps) {
  return <View className={cn('h-px bg-border', className)} {...props} />;
}
