const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findByEmail, findById } = require('../storage/userRepository');
const { validateEmail, validatePassword, validateName } = require('../utils/validation');
const { getJwtSecret } = require('../utils/jwtSecret');

const router = express.Router();

const formatUser = (user) => ({
  id: user._id,
  name: user.name || '',
  email: user.email,
});

const createToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name || '' },
    getJwtSecret(),
    { expiresIn: '24h' }
  );

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return res.status(400).json({ message: emailResult.message, code: 'VALIDATION_ERROR' });
    }

    const nameResult = validateName(name);
    if (!nameResult.valid) {
      return res.status(400).json({ message: nameResult.message, code: 'VALIDATION_ERROR' });
    }

    const passwordResult = validatePassword(password, { forSignup: true });
    if (!passwordResult.valid) {
      return res.status(400).json({ message: passwordResult.message, code: 'VALIDATION_ERROR' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.', code: 'VALIDATION_ERROR' });
    }

    const existingUser = await findByEmail(emailResult.value);
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please sign in instead.',
        code: 'USER_EXISTS',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: nameResult.value,
      email: emailResult.value,
      password: hashedPassword,
    });

    const token = createToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return res.status(400).json({ message: emailResult.message, code: 'VALIDATION_ERROR' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Password is required.', code: 'VALIDATION_ERROR' });
    }

    const user = await findByEmail(emailResult.value);
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email. Please sign up before signing in.',
        code: 'USER_NOT_FOUND',
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        message: 'Incorrect password. Please try again.',
        code: 'INVALID_PASSWORD',
      });
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await findById(decoded.id);

    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({ valid: true, user: formatUser(user) });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
