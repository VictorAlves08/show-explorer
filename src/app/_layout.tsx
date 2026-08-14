import '../../global.css';

import { Stack } from 'expo-router';

import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="shows/[id]" options={{ title: 'Show Detail' }} />
      </Stack>
    </AppProviders>
  );
}
