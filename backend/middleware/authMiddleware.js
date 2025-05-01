const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_strong_secret';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Auth middleware - Token received:', token ? 'exists' : 'missing');
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully, user ID:', decoded.sub);
    
    // Find the user by id from the token payload
    const user = await User.findByPk(decoded.sub);
    
    if (!user) {
      console.log('Auth middleware - User not found in database');
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }
    
    console.log('Auth middleware - User found:', user.id, 'Type:', user.userType);
    
    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.userType || decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware - Token verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Middleware to verify user type
const authorizeRole = (roles) => {
  return (req, res, next) => {
    console.log(`Auth middleware - Checking role: ${req.user.userType} against allowed roles:`, roles);
    
    if (!roles.includes(req.user.userType)) {
      console.log('Auth middleware - Role not authorized');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Not authorized.' 
      });
    }
    
    console.log('Auth middleware - Role authorized');
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };