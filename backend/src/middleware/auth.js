const jwt = require('jsonwebtoken');
const User = require('../models/User');

function protect(req, res, next) {
  const authHeader = req.headers.authorization || req.cookies?.token;
  let token;
  if (authHeader && authHeader.startsWith && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (typeof authHeader === 'string') {
    token = authHeader;
  }
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, token missing'));
  }
  
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not configured in environment variables');
    res.status(500);
    return next(new Error('Server configuration error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { 
      id: decoded.id, 
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    };
    return next();
  } catch (e) {
    // Differentiate between expired and invalid tokens
    if (e.name === 'TokenExpiredError') {
      res.status(401);
      return next(new Error('Token expired, please login again'));
    }
    res.status(401);
    return next(new Error('Not authorized, token invalid'));
  }
}

function authorize(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    if (!allowed.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }
    next();
  };
}

async function canModifyPost(req, res, next) {
  // set by controllers when loading a post: req.post
  if (!req.user || !req.post) {
    res.status(401);
    return next(new Error('Not authorized'));
  }
  if (req.user.role === 'admin' || String(req.post.author) === req.user.id) return next();
  res.status(403);
  return next(new Error('Forbidden'));
}

module.exports = { protect, authorize, canModifyPost };



