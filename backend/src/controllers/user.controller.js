const User = require('../models/User');
const Post = require('../models/Post');

async function listMyPosts(req, res, next) {
  try {
    const posts = await Post.find({ author: req.user.id }).sort('-createdAt');
    res.json({ posts });
  } catch (e) { next(e); }
}

async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json({ user });
  } catch (e) { next(e); }
}

module.exports = { listMyPosts, getUserById };


