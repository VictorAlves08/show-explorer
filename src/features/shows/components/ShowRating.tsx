import { Text } from '@/components/ui/Text';

type ShowRatingProps = {
  rating: number | null;
};

export function ShowRating({ rating }: ShowRatingProps) {
  if (rating === null) {
    return (
      <Text variant="muted" accessibilityLabel="Rating unavailable">
        Rating unavailable
      </Text>
    );
  }

  return (
    <Text variant="label" accessibilityLabel={`Rating ${rating.toFixed(1)} out of 10`}>
      {`★ ${rating.toFixed(1)}`}
    </Text>
  );
}
