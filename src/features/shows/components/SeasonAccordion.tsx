import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, UIManager, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { composePressedStyle } from '@/components/ui/pressableStyle';
import type { Season } from '@/features/shows/domain/season';

import { EpisodeRow } from './EpisodeRow';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type SeasonAccordionProps = {
  season: Season;
  defaultExpanded?: boolean;
};

function formatEpisodeCount(count: number) {
  return count === 1 ? '1 episode' : `${count} episodes`;
}

export function SeasonAccordion({ season, defaultExpanded = false }: SeasonAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const episodeCount = formatEpisodeCount(season.episodes.length);
  const seasonLabel = `Season ${season.number}`;
  const expandedLabel = expanded ? 'expanded' : 'collapsed';

  const toggleExpanded = () => {
    LayoutAnimation.configureNext({
      duration: 180,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        duration: 120,
        property: LayoutAnimation.Properties.opacity,
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    setExpanded((current) => !current);
  };

  return (
    <View className="rounded-md border border-border bg-surface px-md">
      <Pressable
        accessibilityLabel={`${seasonLabel}, ${episodeCount}, ${expandedLabel}`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="min-h-12 flex-row items-center justify-between gap-md py-sm"
        onPress={toggleExpanded}
        style={(state) => composePressedStyle(undefined, state, { opacity: 0.75 })}
      >
        <View className="min-w-0 flex-1">
          <Text variant="title">{seasonLabel}</Text>
          <Text variant="muted">{episodeCount}</Text>
        </View>
        <Ionicons
          accessibilityElementsHidden
          color="#64748b"
          importantForAccessibility="no-hide-descendants"
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
        />
      </Pressable>

      {expanded ? (
        <View accessibilityLabel={`${seasonLabel} episodes`}>
          {season.episodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} seasonNumber={season.number} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
