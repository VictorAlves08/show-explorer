import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useFavorites } from '@/features/favorites/hooks/useFavorites';
import { useOptionalSafeAreaInsets } from '@/hooks/useOptionalSafeAreaInsets';

export default function TabsLayout() {
  const { favorites, isHydrated } = useFavorites();
  const insets = useOptionalSafeAreaInsets();
  const favoritesCount = favorites.length;
  const tabBarBottomPadding = Math.max(insets.bottom, 12);

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
          height: 64 + tabBarBottomPadding,
          paddingBottom: tabBarBottomPadding,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              accessibilityElementsHidden
              color={color}
              importantForAccessibility="no-hide-descendants"
              name={focused ? 'home' : 'home-outline'}
              size={size}
            />
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
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              accessibilityElementsHidden
              color={color}
              importantForAccessibility="no-hide-descendants"
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
            />
          ),
          tabBarLabel: 'Favorites',
          title: 'Favorites',
        }}
      />
    </Tabs>
  );
}
