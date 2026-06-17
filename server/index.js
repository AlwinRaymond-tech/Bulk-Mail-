require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');
const createEmailStore = require('./storage/fileStore');
const createUserStore = require('./storage/userStore');

const app = express();
const PORT = process.env.PORT || 5000;

const parseAllowedOrigins = (value) =>
  value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : null;

const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bulk Mail API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bulkmail';

    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to MongoDB');
    } catch {
      console.warn('MongoDB unavailable — using local file storage (dev mode)');
      global.emailStore = createEmailStore();
      global.userStore = createUserStore();
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
