const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

let users = [];

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
  users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const save = () => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
};

const createUserStore = () => {
  load();

  return {
    async create(data) {
      const record = {
        _id: crypto.randomUUID(),
        ...data,
        email: data.email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(record);
      save();
      return record;
    },

    async findByEmail(email) {
      const normalized = email.toLowerCase().trim();
      return users.find((user) => user.email === normalized) || null;
    },

    async findById(id) {
      return users.find((user) => user._id === id) || null;
    },
  };
};

module.exports = createUserStore;
