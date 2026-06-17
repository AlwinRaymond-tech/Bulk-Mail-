const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtSecret');

const isLocalDevAuthEnabled = () => process.env.NODE_ENV !== 'production';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isLocalDevAuthEnabled()) {
      req.user = { id: 'dev-user', email: 'dev@example.com', name: 'Developer' };
      return next();
    }

    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch {
    if (isLocalDevAuthEnabled()) {
      req.user = { id: 'dev-user', email: 'dev@example.com', name: 'Developer' };
      return next();
    }

    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
