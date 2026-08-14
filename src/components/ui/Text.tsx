import type { TextProps as NativeTextProps } from 'react-native';
import { Text as NativeText } from 'react-native';

import { cn } from './classNames';

type TextVariant = 'body' | 'muted' | 'label' | 'title' | 'heading';

type TextProps = NativeTextProps & {
  variant?: TextVariant;
  className?: string;
};

const variantClassNames: Record<TextVariant, string> = {
  body: 'text-base text-foreground',
  muted: 'text-sm text-foreground-muted',
  label: 'text-sm font-medium text-foreground',
  title: 'text-lg font-semibold text-foreground',
  heading: 'text-2xl font-bold text-foreground',
};

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <NativeText className={cn(variantClassNames[variant], className)} {...props} />;
}
