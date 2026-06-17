const hasSmtpConfig = (env = process.env) => {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
};

const shouldUseDemoDelivery = (env = process.env) => {
  return !hasSmtpConfig(env);
};

const getEmailDeliveryMode = (env = process.env) => {
  const useDemo = shouldUseDemoDelivery(env);

  return {
    useDemo,
    mode: useDemo ? 'demo' : 'smtp',
  };
};

const getSuccessMessage = (recipientCount, env = process.env) => {
  const deliveryMode = getEmailDeliveryMode(env);
  const label = recipientCount === 1 ? 'recipient' : 'recipients';

  if (deliveryMode.useDemo) {
    return `Campaign launched successfully for ${recipientCount} ${label} in demo mode.`;
  }

  return `Campaign sent successfully to ${recipientCount} ${label}.`;
};

const getCampaignStatus = (env = process.env, fallbackStatus = 'sent') => {
  const deliveryMode = getEmailDeliveryMode(env);
  return deliveryMode.useDemo ? 'simulated' : fallbackStatus;
};

module.exports = {
  hasSmtpConfig,
  shouldUseDemoDelivery,
  getEmailDeliveryMode,
  getSuccessMessage,
  getCampaignStatus,
};
