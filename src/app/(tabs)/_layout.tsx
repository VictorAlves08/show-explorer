import { Tabs } from 'expo-router';

import { useFavorites } from '@/features/favorites/hooks/useFavorites';

export default function TabsLayout() {
  const { favorites, isHydrated } = useFavorites();

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => '⌂',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarBadge: isHydrated ? favorites.length : undefined,
          tabBarIcon: () => '♡',
        }}
      />
    </Tabs>
  );
}
