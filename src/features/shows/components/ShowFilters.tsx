import { View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { SearchInput } from '@/components/ui/SearchInput';
import { Text } from '@/components/ui/Text';

import type { MinimumRating, StatusFilter } from '../domain/showFilters';

type ShowFiltersProps = {
  search: string;
  status: StatusFilter;
  minimumRating: MinimumRating;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onMinimumRatingChange: (minimumRating: MinimumRating) => void;
};

const statusOptions: readonly {
  label: string;
  value: StatusFilter;
  accessibilityLabel: string;
}[] = [
  { label: 'All', value: 'all', accessibilityLabel: 'Status All' },
  { label: 'Running', value: 'running', accessibilityLabel: 'Status Running' },
  { label: 'Ended', value: 'ended', accessibilityLabel: 'Status Ended' },
  {
    label: 'TBD',
    value: 'to-be-determined',
    accessibilityLabel: 'Status To Be Determined',
  },
];

const ratingOptions: readonly {
  label: string;
  value: MinimumRating;
  accessibilityLabel: string;
}[] = [
  { label: 'Any', value: null, accessibilityLabel: 'Rating Any' },
  { label: '6+', value: 6, accessibilityLabel: 'Rating 6 or higher' },
  { label: '7+', value: 7, accessibilityLabel: 'Rating 7 or higher' },
  { label: '8+', value: 8, accessibilityLabel: 'Rating 8 or higher' },
  { label: '9+', value: 9, accessibilityLabel: 'Rating 9 or higher' },
];

export function ShowFilters({
  search,
  status,
  minimumRating,
  onSearchChange,
  onStatusChange,
  onMinimumRatingChange,
}: ShowFiltersProps) {
  return (
    <View className="gap-md">
      <View className="gap-xs">
        <Text variant="label">Search</Text>
        <SearchInput
          accessibilityLabel="Search shows"
          onChangeText={onSearchChange}
          placeholder="Search shows..."
          value={search}
        />
      </View>

      <View className="gap-xs">
        <Text variant="label">Status</Text>
        <View className="flex-row flex-wrap gap-sm">
          {statusOptions.map((option) => (
            <Chip
              accessibilityLabel={option.accessibilityLabel}
              key={option.value}
              onPress={() => onStatusChange(option.value)}
              selected={status === option.value}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>

      <View className="gap-xs">
        <Text variant="label">Rating</Text>
        <View className="flex-row flex-wrap gap-sm">
          {ratingOptions.map((option) => (
            <Chip
              accessibilityLabel={option.accessibilityLabel}
              key={option.label}
              onPress={() => onMinimumRatingChange(option.value)}
              selected={minimumRating === option.value}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>
    </View>
  );
}
