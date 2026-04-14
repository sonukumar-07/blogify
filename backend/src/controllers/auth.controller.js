const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      name: user.name,
      email: user.email
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 Registration attempt:', { name, email, hasPassword: !!password });
    
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Missing required fields');
    }
    
    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('⚠️  User already exists:', email);
      res.status(409);
      throw new Error('User already exists');
    }
    
    console.log('✅ Creating new user...');
    const user = await User.create({ name, email, password });
    console.log('✅ User created successfully:', { id: user._id, email: user.email });
    
    const token = generateToken(user);
    
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    const token = generateToken(user);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updates = (({ name, avatarUrl, bio, social }) => ({ name, avatarUrl, bio, social }))(req.body);
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateProfile };



