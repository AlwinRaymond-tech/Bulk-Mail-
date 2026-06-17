const test = require('node:test');
const assert = require('node:assert/strict');
const authMiddleware = require('./auth');

test('allows local development requests without a token', () => {
  process.env.NODE_ENV = 'development';

  let called = false;
  const req = { headers: {} };
  const res = {
    statusCode: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json() {},
  };

  authMiddleware(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.user.email, 'dev@example.com');
});

test('still blocks missing tokens in production', () => {
  process.env.NODE_ENV = 'production';

  let called = false;
  const req = { headers: {} };
  const res = {
    statusCode: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json() {},
  };

  authMiddleware(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
});
