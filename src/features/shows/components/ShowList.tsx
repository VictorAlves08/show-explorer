import { FlashList } from '@shopify/flash-list';
import type { FlashListProps, ListRenderItem } from '@shopify/flash-list';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { ShowListItem } from '@/features/shows/domain/show';

import { ShowCard } from './ShowCard';

type ShowListProps = Omit<
  FlashListProps<ShowListItem>,
  'data' | 'renderItem' | 'keyExtractor' | 'ItemSeparatorComponent'
> & {
  shows: readonly ShowListItem[];
  onShowPress?: (show: ShowListItem) => void;
  renderShowAction?: (show: ShowListItem) => ReactNode;
};

export function ShowList({
  shows,
  onShowPress,
  renderShowAction,
  contentContainerStyle,
  ...props
}: ShowListProps) {
  const renderItem: ListRenderItem<ShowListItem> = ({ item }) => (
    <ShowCard
      action={renderShowAction?.(item)}
      show={item}
      onPress={onShowPress ? () => onShowPress(item) : undefined}
    />
  );

  return (
    <FlashList
      contentContainerStyle={contentContainerStyle}
      data={shows}
      ItemSeparatorComponent={ShowListSeparator}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      {...props}
    />
  );
}

function ShowListSeparator() {
  return <View className="h-md" />;
}
