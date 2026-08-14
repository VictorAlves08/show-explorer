import type { PressableProps } from 'react-native';
import { Pressable } from 'react-native';

import { cn } from './classNames';
import { composePressedStyle } from './pressableStyle';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  textClassName?: string;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'border border-border bg-surface',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const textClassNames: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-foreground',
  ghost: 'text-foreground',
  danger: 'text-primary-foreground',
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-md',
  md: 'min-h-12 px-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  textClassName,
  children,
  disabled,
  accessibilityRole = 'button',
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: Boolean(disabled) }}
      className={cn(
        'items-center justify-center rounded-md',
        sizeClassNames[size],
        variantClassNames[variant],
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      style={(state) => composePressedStyle(style, state, disabled ? {} : { opacity: 0.8 })}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text variant="label" className={cn(textClassNames[variant], textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
