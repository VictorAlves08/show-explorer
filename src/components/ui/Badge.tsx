import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { cn } from './classNames';
import { Text } from './Text';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger';

type BadgeProps = ViewProps & {
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
  children: ReactNode;
};

const variantClassNames: Record<BadgeVariant, string> = {
  neutral: 'border-border bg-surface-muted',
  success: 'border-success bg-surface',
  warning: 'border-warning bg-surface',
  danger: 'border-danger bg-surface',
};

const textClassNames: Record<BadgeVariant, string> = {
  neutral: 'text-foreground-muted',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function Badge({
  variant = 'neutral',
  className,
  textClassName,
  children,
  ...props
}: BadgeProps) {
  return (
    <View
      className={cn(
        'self-start rounded-sm border px-sm py-xs',
        variantClassNames[variant],
        className,
      )}
      {...props}
    >
      <Text variant="label" className={cn('text-xs', textClassNames[variant], textClassName)}>
        {children}
      </Text>
    </View>
  );
}
