import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export default function ShowDetailPlaceholderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen padded className="justify-center">
      <Text variant="heading">Show Detail</Text>
      <Text variant="muted" className="mt-sm">
        Show {id}
      </Text>
    </Screen>
  );
}
