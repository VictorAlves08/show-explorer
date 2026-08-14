import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { composePressedStyle } from '@/components/ui/pressableStyle';
import type { Season } from '@/features/shows/domain/season';

import { EpisodeRow } from './EpisodeRow';

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

  return (
    <View className="rounded-md border border-border bg-surface px-md">
      <Pressable
        accessibilityLabel={`${seasonLabel}, ${episodeCount}, ${expandedLabel}`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="min-h-12 flex-row items-center justify-between gap-md py-sm"
        onPress={() => setExpanded((current) => !current)}
        style={(state) => composePressedStyle(undefined, state, { opacity: 0.75 })}
      >
        <View className="min-w-0 flex-1">
          <Text variant="title">{seasonLabel}</Text>
          <Text variant="muted">{episodeCount}</Text>
        </View>
        <Text variant="title" accessibilityElementsHidden importantForAccessibility="no">
          {expanded ? '-' : '+'}
        </Text>
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
