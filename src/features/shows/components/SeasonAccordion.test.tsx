import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { Season } from '@/features/shows/domain/season';

import { SeasonAccordion } from './SeasonAccordion';

const season: Season = {
  number: 2,
  episodes: [
    {
      id: 1,
      name: 'The First One',
      season: 2,
      number: 1,
      runtime: 42,
      airdate: '2020-01-01',
      summary: null,
    },
    {
      id: 2,
      name: 'The Second One',
      season: 2,
      number: 2,
      runtime: null,
      airdate: null,
      summary: null,
    },
  ],
};

describe('SeasonAccordion', () => {
  it('renders season label and episode count while collapsed by default', async () => {
    await render(<SeasonAccordion season={season} />);

    expect(screen.getByText('Season 2')).toBeTruthy();
    expect(screen.getByText('2 episodes')).toBeTruthy();
    expect(screen.queryByText('The First One')).toBeNull();
    expect(
      screen.getByLabelText('Season 2, 2 episodes, collapsed').props.accessibilityState,
    ).toEqual({
      expanded: false,
    });
  });

  it('shows episodes when expanded by default', async () => {
    await render(<SeasonAccordion season={season} defaultExpanded />);

    expect(screen.getByText('The First One')).toBeTruthy();
    expect(screen.getByText('S02E01 / 2020-01-01 / 42 min')).toBeTruthy();
    expect(
      screen.getByLabelText('Season 2, 2 episodes, expanded').props.accessibilityState,
    ).toEqual({
      expanded: true,
    });
  });

  it('toggles expanded state when pressed', async () => {
    await render(<SeasonAccordion season={season} />);

    fireEvent.press(screen.getByText('Season 2'));

    await waitFor(() => expect(screen.getByText('The Second One')).toBeTruthy());
    expect(
      screen.getByLabelText('Season 2, 2 episodes, expanded').props.accessibilityState,
    ).toEqual({
      expanded: true,
    });

    fireEvent.press(screen.getByText('Season 2'));

    await waitFor(() => expect(screen.queryByText('The Second One')).toBeNull());
    expect(
      screen.getByLabelText('Season 2, 2 episodes, collapsed').props.accessibilityState,
    ).toEqual({
      expanded: false,
    });
  });
});
