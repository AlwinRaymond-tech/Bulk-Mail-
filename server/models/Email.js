const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    recipients: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one recipient is required',
      },
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'partial', 'simulated'],
      default: 'sent',
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    sendErrors: [
      {
        recipient: String,
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Email', emailSchema);
