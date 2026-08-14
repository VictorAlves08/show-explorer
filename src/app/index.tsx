import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-md">
      <View className="rounded-lg border border-border bg-surface p-lg">
        <Text className="text-xl font-bold text-foreground">Show Explorer</Text>

        <Text className="mt-sm text-foreground-muted">TV shows discovery</Text>
      </View>
    </View>
  );
}
