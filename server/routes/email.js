const express = require('express');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/auth');
const {
  createRecord,
  listRecords,
  countRecords,
  findRecordById,
} = require('../storage/emailRepository');
const { getEmailDeliveryMode, getSuccessMessage, getCampaignStatus, shouldUseDemoDelivery } = require('../utils/emailDelivery');

const router = express.Router();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const parseRecipients = (recipientsInput) => {
  if (Array.isArray(recipientsInput)) {
    return recipientsInput.map((e) => e.trim()).filter(Boolean);
  }
  return recipientsInput
    .split(/[,;\n]+/)
    .map((e) => e.trim())
    .filter(Boolean);
};

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;

    if (!subject || !body || !recipients) {
      return res.status(400).json({
        message: 'Subject, body, and recipients are required.',
      });
    }

    const recipientList = parseRecipients(recipients);

    if (recipientList.length === 0) {
      return res.status(400).json({ message: 'At least one recipient is required.' });
    }

    const invalidEmails = recipientList.filter((email) => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        message: 'Invalid email addresses found.',
        invalidEmails,
      });
    }

    const deliveryMode = getEmailDeliveryMode(process.env);
    const shouldUseDemoDeliveryForEnv = shouldUseDemoDelivery(process.env);

    if (shouldUseDemoDeliveryForEnv) {
      const emailRecord = await createRecord({
        subject,
        body,
        recipients: recipientList,
        status: getCampaignStatus(process.env),
        sentCount: 0,
        failedCount: 0,
        sendErrors: [],
      });

      console.warn('SMTP not configured; using demo delivery mode.');
      return res.status(200).json({
        message: getSuccessMessage(recipientList.length, process.env),
        email: emailRecord,
        demoMode: true,
        deliveryMode: 'demo',
      });
    }

    const transporter = createTransporter();

    let sentCount = 0;
    let failedCount = 0;
    const sendErrors = [];

    for (const recipient of recipientList) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: recipient,
          subject,
          text: body,
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${body.replace(/\n/g, '<br>')}</div>`,
        });
        sentCount++;
        console.log(`Email sent to: ${recipient}`);
      } catch (err) {
        failedCount++;
        sendErrors.push({ recipient, message: err.message });
        console.error(`Failed to send to ${recipient}:`, err.message);
      }
    }

    let status = 'sent';
    if (failedCount === recipientList.length) {
      status = 'failed';
    } else if (failedCount > 0) {
      status = 'partial';
    }

    const emailRecord = await createRecord({
      subject,
      body,
      recipients: recipientList,
      status,
      sentCount,
      failedCount,
      sendErrors,
    });

    if (status === 'failed') {
      return res.status(500).json({
        message: 'Failed to send emails to all recipients.',
        details: sendErrors[0]?.message || 'SMTP delivery failed.',
        email: emailRecord,
      });
    }

    res.status(200).json({
      message:
        status === 'partial'
          ? `Sent to ${sentCount} of ${recipientList.length} recipients.`
          : `Successfully sent to all ${sentCount} recipients.`,
      email: emailRecord,
      demoMode: false,
      deliveryMode: 'smtp',
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error while sending emails.' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      listRecords({ skip, limit }),
      countRecords(),
    ]);

    res.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ message: 'Server error while fetching email history.' });
  }
});

router.get('/history/:id', authMiddleware, async (req, res) => {
  try {
    const email = await findRecordById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email record not found.' });
    }

    res.json(email);
  } catch (error) {
    console.error('Fetch email error:', error);
    res.status(500).json({ message: 'Server error while fetching email record.' });
  }
});

module.exports = router;
