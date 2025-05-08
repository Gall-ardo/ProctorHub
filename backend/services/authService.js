// backend/services/authService.js
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");
const Token = require("../models/passwordResetToken");

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

  const token = jwt.sign(
    { sub: user.id, role: user.userType },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, role: user.userType };
}

async function requestPasswordReset(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) return false;
  
  // generate random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes duration

  // store token
  await Token.upsert({ token, userId: user.id, expiresAt });

  return { token, user };
}


async function resetPassword(tokenString, newPlain) {
  // find a non-expired token
  const record = await Token.findOne({
    where: {
      token: tokenString,
      expiresAt: { [Op.gt]: new Date() }
    }
  });
  if (!record) throw new Error("Invalid or expired token");

  const user = await User.findByPk(record.userId);
  if (!user) throw new Error("User not found");

  // hash and update
  user.password = await bcrypt.hash(newPlain, 12);
  await user.save();

  // remove the used token
  await record.destroy();

  return true;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  // check if the current password matches the old one
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  // hash new password
  user.password = await bcrypt.hash(newPassword, 12);
  
  // save the user with the new password
  await user.save();
  
  return true;
}
module.exports = { authenticate, requestPasswordReset, resetPassword, changePassword };