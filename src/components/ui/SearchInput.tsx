import type { TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';

import { cn } from './classNames';

type SearchInputProps = TextInputProps & {
  className?: string;
  inputClassName?: string;
};

export function SearchInput({
  className,
  inputClassName,
  accessibilityLabel = 'Search',
  placeholderTextColor = '#64748b',
  ...props
}: SearchInputProps) {
  return (
    <View className={cn('rounded-md border border-border bg-surface px-md py-sm', className)}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        className={cn('min-h-8 text-base text-foreground', inputClassName)}
        placeholderTextColor={placeholderTextColor}
        returnKeyType="search"
        {...props}
      />
    </View>
  );
}
