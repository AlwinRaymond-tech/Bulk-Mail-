const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'emails.json');

let emails = [];

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
};

const load = () => {
  ensureDataFile();
  emails = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const save = () => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(emails, null, 2), 'utf8');
};

const createEmailStore = () => {
  load();

  return {
    async create(data) {
      const record = {
        _id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      emails.unshift(record);
      save();
      return record;
    },

    async find(query = {}) {
      return [...emails].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    async findById(id) {
      return emails.find((email) => email._id === id) || null;
    },

    async countDocuments() {
      return emails.length;
    },
  };
};

module.exports = createEmailStore;
