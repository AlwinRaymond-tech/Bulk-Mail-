const test = require('node:test');
const assert = require('node:assert/strict');
const { hasSmtpConfig, getEmailDeliveryMode, getSuccessMessage, getCampaignStatus, shouldUseDemoDelivery } = require('./emailDelivery');

test('detects demo mode when SMTP credentials are missing', () => {
  const result = getEmailDeliveryMode({ SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' });
  assert.equal(result.useDemo, true);
  assert.equal(result.mode, 'demo');
});

test('detects SMTP mode when credentials are present', () => {
  const result = getEmailDeliveryMode({ SMTP_HOST: 'smtp.test.com', SMTP_USER: 'user', SMTP_PASS: 'pass' });
  assert.equal(result.useDemo, false);
  assert.equal(result.mode, 'smtp');
});

test('uses real SMTP delivery in development when credentials are present', () => {
  const shouldDemo = shouldUseDemoDelivery({ SMTP_HOST: 'smtp.test.com', SMTP_USER: 'user', SMTP_PASS: 'pass', NODE_ENV: 'development' });
  assert.equal(shouldDemo, false);
});

test('builds a successful message for demo mode', () => {
  const message = getSuccessMessage(3, { SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' });
  assert.match(message, /demo mode/);
});

test('returns true when SMTP config is complete', () => {
  assert.equal(hasSmtpConfig({ SMTP_HOST: 'smtp.test.com', SMTP_USER: 'user', SMTP_PASS: 'pass' }), true);
});

test('marks demo-mode campaigns as simulated instead of delivered', () => {
  const status = getCampaignStatus({ SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' });
  assert.equal(status, 'simulated');
});

test('keeps real SMTP campaigns as sent', () => {
  const status = getCampaignStatus({ SMTP_HOST: 'smtp.test.com', SMTP_USER: 'user', SMTP_PASS: 'pass' });
  assert.equal(status, 'sent');
});
