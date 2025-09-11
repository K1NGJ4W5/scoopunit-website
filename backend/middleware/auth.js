const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Client portal access - only clients
const requireClient = requireRole(['client']);

// Employee portal access - field techs, managers, admins
const requireEmployee = requireRole(['field_tech', 'manager', 'admin']);

// Admin access only
const requireAdmin = requireRole(['admin']);

// Manager or admin access
const requireManager = requireRole(['manager', 'admin']);

module.exports = {
  verifyToken,
  requireRole,
  requireClient,
  requireEmployee,
  requireAdmin,
  requireManager
};