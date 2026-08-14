import type { PressableProps } from 'react-native';
import { Pressable } from 'react-native';

import { cn } from './classNames';
import { composePressedStyle } from './pressableStyle';
import { Text } from './Text';

type ChipProps = PressableProps & {
  selected?: boolean;
  className?: string;
  textClassName?: string;
};

export function Chip({
  selected = false,
  disabled,
  className,
  textClassName,
  children,
  accessibilityRole = 'button',
  style,
  ...props
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      className={cn(
        'min-h-10 items-center justify-center rounded-md border px-md',
        selected ? 'border-primary bg-primary' : 'border-border bg-surface',
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      style={(state) => composePressedStyle(style, state, disabled ? {} : { opacity: 0.8 })}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          variant="label"
          className={cn(selected ? 'text-primary-foreground' : 'text-foreground', textClassName)}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
