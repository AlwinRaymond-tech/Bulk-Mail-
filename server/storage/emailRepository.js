const Email = require('../models/Email');

const getStore = () => global.emailStore || null;

const createRecord = async (data) => {
  const store = getStore();
  if (store) return store.create(data);
  return Email.create(data);
};

const listRecords = async ({ skip, limit }) => {
  const store = getStore();
  if (store) {
    const all = await store.find();
    return all.slice(skip, skip + limit);
  }
  return Email.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
};

const countRecords = async () => {
  const store = getStore();
  if (store) return store.countDocuments();
  return Email.countDocuments();
};

const findRecordById = async (id) => {
  const store = getStore();
  if (store) return store.findById(id);
  return Email.findById(id);
};

module.exports = {
  createRecord,
  listRecords,
  countRecords,
  findRecordById,
};
