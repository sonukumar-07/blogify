const Post = require('../models/Post');

async function search(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.json({ results: [] });
    
    const regex = new RegExp(q, 'i');
    const results = await Post.find({ 
      $or: [
        { title: regex }, 
        { content: regex }, 
        { tags: regex }, 
        { category: regex }
      ],
      status: 'published' // Only search published posts
    })
      .populate('author', 'name avatarUrl')
      .limit(20)
      .select('title slug summary coverImageUrl author createdAt')
      .sort('-createdAt');
    
    res.json({ results });
  } catch (e) { next(e); }
}

module.exports = { search };



