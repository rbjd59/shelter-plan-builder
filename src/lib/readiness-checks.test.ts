import { describe, expect, it } from 'vitest';
import { homeEquity } from './readiness-checks';
describe('planning arithmetic, not lending approval', () => {
 it('subtracts home debt from estimated home value', () => expect(homeEquity(400000, 250000)).toBe(150000));
 it('keeps negative equity rather than implying available funds', () => expect(homeEquity(200000, 250000)).toBe(-50000));
 it('does not calculate invalid amounts', () => expect(homeEquity(NaN, 100)).toBeNull());
});
