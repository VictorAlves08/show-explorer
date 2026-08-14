import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { cn } from './classNames';
import { Text } from './Text';

type EmptyStateProps = ViewProps & {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <View className={cn('items-center gap-sm px-lg py-xl', className)} {...props}>
      <Text variant="title" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="muted" className="text-center">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-sm">{action}</View> : null}
    </View>
  );
}
