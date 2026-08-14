import { Image } from 'expo-image';
import type { PressableProps } from 'react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/components/ui/classNames';
import { composePressedStyle } from '@/components/ui/pressableStyle';
import type { ShowListItem } from '@/features/shows/domain/show';

import { ShowRating } from './ShowRating';
import { ShowStatusBadge } from './ShowStatusBadge';

type ShowCardProps = Omit<PressableProps, 'children'> & {
  show: ShowListItem;
  onPress?: () => void;
  className?: string;
};

export function ShowCard({
  show,
  onPress,
  className,
  accessibilityRole = 'button',
  accessibilityLabel = `Open details for ${show.name}`,
  style,
  ...props
}: ShowCardProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      className={cn('rounded-md border border-border bg-surface p-sm', className)}
      onPress={onPress}
      style={(state) => composePressedStyle(style, state, onPress ? { opacity: 0.85 } : {})}
      {...props}
    >
      <View className="flex-row gap-md">
        <View className="aspect-[2/3] w-24 overflow-hidden rounded-sm bg-surface-muted">
          {show.imageUrl ? (
            <Image
              accessibilityIgnoresInvertColors
              contentFit="cover"
              source={{ uri: show.imageUrl }}
              style={{ height: '100%', width: '100%' }}
            />
          ) : (
            <View
              accessibilityLabel={`No image available for ${show.name}`}
              className="h-full w-full items-center justify-center px-sm"
            >
              <Text variant="muted" className="text-center text-xs">
                No image
              </Text>
            </View>
          )}
        </View>

        <View className="min-w-0 flex-1 justify-between gap-sm py-xs">
          <View className="gap-xs">
            <Text variant="title" numberOfLines={2}>
              {show.name}
            </Text>
            {show.genres.length > 0 ? (
              <Text variant="muted" numberOfLines={1}>
                {show.genres.join(', ')}
              </Text>
            ) : null}
          </View>

          <View className="gap-sm">
            <ShowStatusBadge status={show.status} />
            <ShowRating rating={show.rating} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
