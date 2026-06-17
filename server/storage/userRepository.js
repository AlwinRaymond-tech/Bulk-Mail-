const User = require('../models/User');

const getStore = () => global.userStore || null;

const createUser = async (data) => {
  const store = getStore();
  if (store) return store.create(data);
  return User.create(data);
};

const findByEmail = async (email) => {
  const store = getStore();
  if (store) return store.findByEmail(email);
  return User.findOne({ email: email.toLowerCase().trim() });
};

const findById = async (id) => {
  const store = getStore();
  if (store) return store.findById(id);
  return User.findById(id);
};

module.exports = {
  createUser,
  findByEmail,
  findById,
};
