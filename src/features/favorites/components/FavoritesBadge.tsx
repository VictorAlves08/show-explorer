import { Badge } from '@/components/ui/Badge';

import { useFavorites } from '../hooks/useFavorites';

export function FavoritesBadge() {
  const { favorites, isHydrated } = useFavorites();
  const accessibilityLabel = isHydrated
    ? `${favorites.length} favorite${favorites.length === 1 ? '' : 's'}`
    : 'Favorites loading';

  return (
    <Badge accessibilityLabel={accessibilityLabel}>{isHydrated ? favorites.length : '...'}</Badge>
  );
}
