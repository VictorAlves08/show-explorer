import type { PressableProps } from 'react-native';
import { Pressable } from 'react-native';

import { cn } from './classNames';
import { composePressedStyle } from './pressableStyle';

type IconButtonProps = PressableProps & {
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClassNames = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
} as const;

export function IconButton({
  size = 'md',
  className,
  disabled,
  accessibilityRole = 'button',
  style,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: Boolean(disabled) }}
      className={cn(
        'items-center justify-center rounded-md border border-border bg-surface',
        sizeClassNames[size],
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      style={(state) => composePressedStyle(style, state, disabled ? {} : { opacity: 0.75 })}
      {...props}
    />
  );
}
