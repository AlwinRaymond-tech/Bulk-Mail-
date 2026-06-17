import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubmissionGuard } from './submitGuard.js';

test('blocks overlapping submissions until the previous one finishes', () => {
  const guard = createSubmissionGuard();

  assert.equal(guard.begin(), true);
  assert.equal(guard.begin(), false);

  guard.end();

  assert.equal(guard.begin(), true);
  assert.equal(guard.isLocked(), true);
});
