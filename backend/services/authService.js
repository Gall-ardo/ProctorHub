// backend/services/authService.js
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_strong_secret';

async function authenticate(email, plainPassword) {
  // email check
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // password check
  const match = await bcrypt.compare(plainPassword, user.password);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  // 3. Issue a short JWT payload with id and role
  const token = jwt.sign(
    { sub: user.id, role: user.userType },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return { token, role: user.userType };
}

module.exports = { authenticate };