import { Ionicons } from '@expo/vector-icons';

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
      <Ionicons
        accessibilityElementsHidden
        color={selected ? '#db2777' : '#64748b'}
        importantForAccessibility="no-hide-descendants"
        name={selected ? 'heart' : 'heart-outline'}
        size={22}
      />
    </IconButton>
  );
}
