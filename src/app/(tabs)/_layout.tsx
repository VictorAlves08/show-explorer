import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useFavorites } from '@/features/favorites/hooks/useFavorites';

export default function TabsLayout() {
  const { favorites, isHydrated } = useFavorites();
  const favoritesCount = favorites.length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#ffffff' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color }) => (
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ color, fontSize: 20 }}
            >
              {'⌂'}
            </Text>
          ),
          tabBarLabel: 'Home',
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarAccessibilityLabel:
            isHydrated && favoritesCount > 0
              ? `Favorites tab, ${favoritesCount} saved`
              : 'Favorites tab',
          tabBarBadge: isHydrated && favoritesCount > 0 ? favoritesCount : undefined,
          tabBarIcon: ({ color }) => (
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ color, fontSize: 20 }}
            >
              {'♡'}
            </Text>
          ),
          tabBarLabel: 'Favorites',
          title: 'Favorites',
        }}
      />
    </Tabs>
  );
}
