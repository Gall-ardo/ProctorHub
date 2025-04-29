// backend/controllers/authController.js
const AuthService = require('../services/authService');

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const { token, role } = await AuthService.authenticate(email, password);
    // on success, return the JWT & role
    res.json({ token, role });
  } catch (err) {
    // generic 401 on any failure
    res.status(401).json({ message: 'E-mail or Password is Incorrect!' });
  }
}

module.exports = { login };