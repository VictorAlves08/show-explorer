import { describe, expect, it } from '@jest/globals';

import type { ShowListItem } from '../domain/show';
import { filterShows } from './filterShows';

const runningRated: ShowListItem = {
  id: 1,
  name: 'Running Rated',
  imageUrl: null,
  status: 'running',
  rating: 8.1,
  genres: [],
};

const endedRated: ShowListItem = {
  id: 2,
  name: 'Ended Rated',
  imageUrl: null,
  status: 'ended',
  rating: 7.9,
  genres: [],
};

const toBeDeterminedRated: ShowListItem = {
  id: 3,
  name: 'Future Rated',
  imageUrl: null,
  status: 'to-be-determined',
  rating: 9,
  genres: [],
};

const unrated: ShowListItem = {
  id: 4,
  name: 'Unrated',
  imageUrl: null,
  status: 'running',
  rating: null,
  genres: [],
};

const shows = [runningRated, endedRated, toBeDeterminedRated, unrated];

describe('filterShows', () => {
  it('returns all shows for the all status filter', () => {
    expect(filterShows(shows, { status: 'all', minimumRating: null })).toEqual(shows);
  });

  it('filters running shows', () => {
    expect(filterShows(shows, { status: 'running', minimumRating: null })).toEqual([
      runningRated,
      unrated,
    ]);
  });

  it('filters ended shows', () => {
    expect(filterShows(shows, { status: 'ended', minimumRating: null })).toEqual([endedRated]);
  });

  it('filters to-be-determined shows', () => {
    expect(filterShows(shows, { status: 'to-be-determined', minimumRating: null })).toEqual([
      toBeDeterminedRated,
    ]);
  });

  it('includes rated and unrated shows for any rating', () => {
    expect(filterShows(shows, { status: 'all', minimumRating: null })).toEqual(shows);
  });

  it('includes shows with rating greater than or equal to the threshold', () => {
    expect(filterShows(shows, { status: 'all', minimumRating: 8 })).toEqual([
      runningRated,
      toBeDeterminedRated,
    ]);
  });

  it('excludes shows below the rating threshold', () => {
    expect(filterShows(shows, { status: 'all', minimumRating: 9 })).not.toContain(runningRated);
  });

  it('excludes unrated shows for numeric thresholds', () => {
    expect(filterShows(shows, { status: 'all', minimumRating: 6 })).not.toContain(unrated);
  });

  it('combines status and rating with AND semantics', () => {
    expect(filterShows(shows, { status: 'running', minimumRating: 8 })).toEqual([runningRated]);
  });

  it('does not mutate the input array', () => {
    const input = [...shows];

    filterShows(input, { status: 'running', minimumRating: 8 });

    expect(input).toEqual(shows);
  });
});
