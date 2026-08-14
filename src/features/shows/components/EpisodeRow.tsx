import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { Episode } from '@/features/shows/domain/episode';

type EpisodeRowProps = {
  episode: Episode;
  seasonNumber: number;
};

function formatEpisodeCode(seasonNumber: number, episodeNumber: number | null) {
  if (episodeNumber === null) {
    return null;
  }

  return `S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')}`;
}

export function EpisodeRow({ episode, seasonNumber }: EpisodeRowProps) {
  const episodeCode = formatEpisodeCode(seasonNumber, episode.number);
  const metadata = [
    episodeCode,
    episode.airdate,
    episode.runtime === null ? null : `${episode.runtime} min`,
  ].filter((item): item is string => item !== null && item.length > 0);

  return (
    <View className="gap-xs border-t border-border py-sm">
      <Text variant="label">{episode.name}</Text>
      {metadata.length > 0 ? <Text variant="muted">{metadata.join(' / ')}</Text> : null}
    </View>
  );
}
