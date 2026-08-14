import { describe, expect, it } from '@jest/globals';

import { showKeys } from './show.keys';

describe('showKeys', () => {
  it('creates distinct hierarchical keys for shows resources', () => {
    expect(showKeys.browse()).toEqual(['shows', 'list', 'browse']);
    expect(showKeys.search('girls')).toEqual(['shows', 'search', 'girls']);
    expect(showKeys.detail(1)).toEqual(['shows', 'detail', 1]);
    expect(showKeys.episodes(1)).toEqual(['shows', 'detail', 1, 'episodes']);
  });

  it('distinguishes resources that must not share cache entries', () => {
    expect(showKeys.browse()).not.toEqual(showKeys.search('girls'));
    expect(showKeys.search('girls')).not.toEqual(showKeys.search('office'));
    expect(showKeys.detail(1)).not.toEqual(showKeys.detail(2));
    expect(showKeys.episodes(1)).not.toEqual(showKeys.episodes(2));
  });
});
