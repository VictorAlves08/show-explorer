import { describe, expect, it } from '@jest/globals';

import { sanitizeShowSummary } from './sanitizeShowSummary';

describe('sanitizeShowSummary', () => {
  it('preserves null summaries', () => {
    expect(sanitizeShowSummary(null)).toBeNull();
  });

  it('preserves plain text', () => {
    expect(sanitizeShowSummary('A quiet drama.')).toBe('A quiet drama.');
  });

  it('removes simple HTML tags', () => {
    expect(sanitizeShowSummary('<p>A <b>quiet</b> drama.</p>')).toBe('A quiet drama.');
  });

  it('normalizes whitespace and simple entities', () => {
    expect(sanitizeShowSummary('<p>A&nbsp;quiet &amp; strange\n\nshow.</p>')).toBe(
      'A quiet & strange show.',
    );
  });
});
