import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { cn } from './classNames';

type ScreenProps = ViewProps & {
  padded?: boolean;
  className?: string;
};

export function Screen({ padded = false, className, ...props }: ScreenProps) {
  return (
    <View className={cn('flex-1 bg-background', padded && 'px-md py-lg', className)} {...props} />
  );
}
