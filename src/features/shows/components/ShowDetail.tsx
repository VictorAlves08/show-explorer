import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Divider } from '@/components/ui/Divider';
import { Text } from '@/components/ui/Text';
import type { Show } from '@/features/shows/domain/show';
import { sanitizeShowSummary } from '@/features/shows/utils/sanitizeShowSummary';

import { ShowRating } from './ShowRating';
import { ShowStatusBadge } from './ShowStatusBadge';

type ShowDetailProps = {
  show: Show;
  action?: ReactNode;
};

export function ShowDetail({ show, action }: ShowDetailProps) {
  const summary = sanitizeShowSummary(show.summary);

  return (
    <View className="gap-md">
      <View className="self-center overflow-hidden rounded-md bg-surface-muted">
        <View className="aspect-[2/3] w-44">
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
              className="h-full w-full items-center justify-center px-lg"
            >
              <Text variant="muted" className="text-center">
                No image available
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="gap-sm">
        <View className="flex-row items-start gap-md">
          <View className="min-w-0 flex-1 gap-xs">
            <Text variant="heading">{show.name}</Text>
            <View className="flex-row flex-wrap items-center gap-sm">
              <ShowStatusBadge status={show.status} />
              <ShowRating rating={show.rating} />
            </View>
          </View>
          {action ? <View>{action}</View> : null}
        </View>

        <View className="gap-xs">
          {show.genres.length > 0 ? <Text variant="muted">{show.genres.join(' / ')}</Text> : null}

          {show.premieredAt ? <Text variant="muted">{`Premiered ${show.premieredAt}`}</Text> : null}
        </View>
      </View>

      {summary ? (
        <>
          <Divider />
          <View className="gap-xs">
            <Text variant="title">Summary</Text>
            <Text>{summary}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}
