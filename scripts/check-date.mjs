import assert from 'node:assert/strict';
import { vietnamDate } from '../lib/date.ts';
assert.equal(vietnamDate(new Date('2026-11-10T16:59:59Z')),'2026-11-10');
assert.equal(vietnamDate(new Date('2026-11-10T17:00:00Z')),'2026-11-11');
console.log('PASS Vietnam day boundary at 17:00 UTC');
