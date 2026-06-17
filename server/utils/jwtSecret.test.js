const test = require('node:test');
const assert = require('node:assert/strict');
const { getJwtSecret } = require('./jwtSecret');

test('falls back to a local dev secret when JWT_SECRET is not set', () => {
  const secret = getJwtSecret({});
  assert.equal(secret, 'bulkmail-dev-secret');
});

test('uses the configured JWT secret when present', () => {
  const secret = getJwtSecret({ JWT_SECRET: 'custom-secret' });
  assert.equal(secret, 'custom-secret');
});
