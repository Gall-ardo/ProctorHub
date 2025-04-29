// backend/controllers/authController.js
const authService = require('../services/authService');
const EmailService = require('../services/emailService');

async function login(req, res) {
  const { email, password } = req.body;
  console.log('🔐 login() called with:', { email, password });

  try {
    const { token, role } = await authService.authenticate(email, password);
    console.log('✅ login successful for', email);
    res.json({ token, role });
  } catch (err) {
    console.log('❌ login failed for', email, 'error:', err.message);
    res.status(401).json({ message: 'E-mail or Password is Incorrect!' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  const result = await authService.requestPasswordReset(email);
  if (!result) {
    // always return 200 so we don’t leak which emails exist
    return res.json({ success: true });
  }
  const { token, user } = result;
  await EmailService.sendPasswordResetEmail(user.email, user.name, token);
  res.json({ success: true });
}

// backend/controllers/authController.js
async function doResetPassword(req, res) {
  const { token, newPassword } = req.body;
  console.log('🔑 Reset request:', { token, newPassword });  // <<< add this

  try {
    await authService.resetPassword(token, newPassword);
    console.log('✅ Password reset successful for token', token);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ Error in reset-password:', err.message);
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { login, forgotPassword, doResetPassword };