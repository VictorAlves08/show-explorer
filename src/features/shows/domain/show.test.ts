import { describe, expect, it } from '@jest/globals';

import { normalizeShowStatus } from './show';

describe('normalizeShowStatus', () => {
  it('maps known statuses to domain statuses', () => {
    expect(normalizeShowStatus('Running')).toBe('running');
    expect(normalizeShowStatus('Ended')).toBe('ended');
    expect(normalizeShowStatus('To Be Determined')).toBe('to-be-determined');
  });

  it('maps unexpected and missing statuses to unknown', () => {
    expect(normalizeShowStatus('In Development')).toBe('unknown');
    expect(normalizeShowStatus(null)).toBe('unknown');
    expect(normalizeShowStatus(undefined)).toBe('unknown');
  });
});
