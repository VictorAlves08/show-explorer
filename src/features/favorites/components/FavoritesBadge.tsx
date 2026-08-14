import { Badge } from '@/components/ui/Badge';

import { useFavorites } from '../hooks/useFavorites';

export function FavoritesBadge() {
  const { favorites, isHydrated } = useFavorites();

  return <Badge>{isHydrated ? favorites.length : '...'}</Badge>;
}
