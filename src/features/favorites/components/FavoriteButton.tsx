import { Text } from '@/components/ui/Text';
import { IconButton } from '@/components/ui/IconButton';
import type { ShowListItem } from '@/features/shows/domain/show';

import { toFavoriteShow } from '../domain/favorite';
import { useFavorites } from '../hooks/useFavorites';

type FavoriteButtonProps = {
  show: ShowListItem;
};

export function FavoriteButton({ show }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const selected = isFavorite(show.id);
  const accessibilityLabel = selected
    ? `Remove ${show.name} from favorites`
    : `Add ${show.name} to favorites`;

  const handlePress = () => {
    void toggleFavorite(toFavoriteShow(show));
  };

  return (
    <IconButton
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !isHydrated, selected }}
      className={selected ? 'border-favorite bg-surface' : undefined}
      disabled={!isHydrated}
      onPress={handlePress}
      size="sm"
    >
      <Text
        variant="title"
        className={selected ? 'text-favorite' : 'text-foreground-muted'}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {selected ? '♥' : '♡'}
      </Text>
    </IconButton>
  );
}
