import { describe, expect, it } from 'vitest';
import { dueReminders, proposedPackageFee, REMINDER_MINUTES, EXCLUDED_POWERS } from './service-file';
describe('service file rules', () => {
 it('uses 60, 30 and 15 minute notices', () => expect(REMINDER_MINUTES).toEqual([60,30,15]));
 it('keeps the proposed lower fee through $500,000', () => { expect(proposedPackageFee(100000)).toBe(2500); expect(proposedPackageFee(500000)).toBe(2500); });
 it('uses the proposed upper tier only above $500,000 through $1m', () => { expect(proposedPackageFee(500001)).toBe(5000); expect(proposedPackageFee(1000000)).toBe(5000); expect(proposedPackageFee(1000001)).toBeNull(); });
 it('does not repeat or send stale reminders', () => { const now = Date.parse('2026-11-17T12:00:00Z'); expect(dueReminders('2026-11-17T13:00:00Z', [], now)).toEqual([60]); expect(dueReminders('2026-11-17T13:00:00Z', [60], now)).toEqual([]); expect(dueReminders('2026-11-17T11:00:00Z', [], now)).toEqual([]); });
 it('excludes all real estate transaction powers from family authority', () => { expect(EXCLUDED_POWERS).toContain('sell real estate'); expect(EXCLUDED_POWERS).toContain('rent real estate'); expect(EXCLUDED_POWERS).toContain('mortgage real estate'); });
});