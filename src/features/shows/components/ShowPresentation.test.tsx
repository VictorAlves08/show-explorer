import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ShowListItem } from '@/features/shows/domain/show';

import { ShowCard } from './ShowCard';
import { ShowList } from './ShowList';
import { ShowRating } from './ShowRating';
import { ShowStatusBadge } from './ShowStatusBadge';

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Image: View,
  };
});

jest.mock('@shopify/flash-list', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  type MockFlashListProps = {
    data?: readonly unknown[] | null;
    renderItem?: (info: {
      item: unknown;
      index: number;
      target: 'Cell';
    }) => React.ReactElement | null;
    keyExtractor?: (item: unknown, index: number) => string;
    ItemSeparatorComponent?: React.ComponentType;
    ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  };

  function FlashList({
    data,
    renderItem,
    keyExtractor,
    ItemSeparatorComponent,
    ListEmptyComponent,
  }: MockFlashListProps) {
    if (!data || data.length === 0) {
      if (React.isValidElement(ListEmptyComponent)) {
        return ListEmptyComponent;
      }

      if (ListEmptyComponent) {
        return <ListEmptyComponent />;
      }

      return <View />;
    }

    return (
      <View>
        {data.map((item, index) => (
          <View key={keyExtractor ? keyExtractor(item, index) : index}>
            {renderItem?.({ item, index, target: 'Cell' })}
            {index < data.length - 1 && ItemSeparatorComponent ? <ItemSeparatorComponent /> : null}
          </View>
        ))}
      </View>
    );
  }

  return { FlashList };
});

const breakingBad: ShowListItem = {
  id: 1,
  name: 'Breaking Bad',
  imageUrl: 'https://example.com/breaking-bad.jpg',
  status: 'ended',
  rating: 9.5,
  genres: ['Drama', 'Crime'],
};

const unratedShow: ShowListItem = {
  id: 2,
  name: 'Mystery Show',
  imageUrl: null,
  status: 'unknown',
  rating: null,
  genres: [],
};

describe('ShowStatusBadge', () => {
  it('maps known and unknown statuses to labels', async () => {
    await render(
      <>
        <ShowStatusBadge status="running" />
        <ShowStatusBadge status="ended" />
        <ShowStatusBadge status="to-be-determined" />
        <ShowStatusBadge status="unknown" />
      </>,
    );

    expect(screen.getByText('Running')).toBeTruthy();
    expect(screen.getByText('Ended')).toBeTruthy();
    expect(screen.getByText('To Be Determined')).toBeTruthy();
    expect(screen.getByText('Status Unknown')).toBeTruthy();
  });
});

describe('ShowRating', () => {
  it('displays available ratings', async () => {
    await render(<ShowRating rating={8.7} />);

    expect(screen.getByText('★ 8.7')).toBeTruthy();
  });

  it('does not render null ratings as zero', async () => {
    await render(<ShowRating rating={null} />);

    expect(screen.queryByText('★ 0.0')).toBeNull();
    expect(screen.getByText('Rating unavailable')).toBeTruthy();
  });
});

describe('ShowCard', () => {
  it('renders show presentation details', async () => {
    await render(<ShowCard show={breakingBad} />);

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('Ended')).toBeTruthy();
    expect(screen.getByText('★ 9.5')).toBeTruthy();
    expect(screen.getByText('Drama, Crime')).toBeTruthy();
  });

  it('handles missing image presentation', async () => {
    await render(<ShowCard show={unratedShow} />);

    expect(screen.getByText('No image')).toBeTruthy();
    expect(screen.getByText('Mystery Show')).toBeTruthy();
  });

  it('forwards press callbacks', async () => {
    const onPress = jest.fn();

    await render(<ShowCard show={breakingBad} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Open details for Breaking Bad' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('ShowList', () => {
  it('renders domain items and forwards item presses', async () => {
    const onShowPress = jest.fn();

    await render(<ShowList shows={[breakingBad, unratedShow]} onShowPress={onShowPress} />);

    expect(screen.getByText('Breaking Bad')).toBeTruthy();
    expect(screen.getByText('Mystery Show')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Open details for Mystery Show' }));

    expect(onShowPress).toHaveBeenCalledWith(unratedShow);
  });

  it('renders an empty component for empty data', async () => {
    await render(<ShowList shows={[]} ListEmptyComponent={<ShowRating rating={null} />} />);

    expect(screen.getByText('Rating unavailable')).toBeTruthy();
  });
});
