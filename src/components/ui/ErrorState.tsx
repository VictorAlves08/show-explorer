import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { Button } from './Button';
import { cn } from './classNames';
import { Text } from './Text';

type ErrorStateProps = ViewProps & {
  title: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ title, description, onRetry, className, ...props }: ErrorStateProps) {
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
      {onRetry ? (
        <Button variant="secondary" className="mt-sm" onPress={onRetry}>
          Try again
        </Button>
      ) : null}
    </View>
  );
}
