const Post = require('../models/Post');

async function loadPostBySlug(req, res, next) {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) { res.status(404); throw new Error('Post not found'); }
    req.post = post;
    next();
  } catch (e) { next(e); }
}

module.exports = { loadPostBySlug };


