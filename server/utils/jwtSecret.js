const DEFAULT_JWT_SECRET = 'bulkmail-dev-secret';

const getJwtSecret = (env = process.env) => env.JWT_SECRET || DEFAULT_JWT_SECRET;

module.exports = {
  DEFAULT_JWT_SECRET,
  getJwtSecret,
};
