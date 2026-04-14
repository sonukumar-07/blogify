const router = require('express').Router();
const { protect, authorize, canModifyPost } = require('../middleware/auth');
const { loadPostBySlug } = require('../middleware/post');
const { validatePost } = require('../middleware/validation');
const { createPost, getPosts, getPostBySlug, updatePost, deletePost, toggleReaction, setStatus, incrementViews } = require('../controllers/post.controller');

router.get('/', getPosts);
router.post('/', protect, validatePost, createPost);
router.get('/:slug', getPostBySlug);
router.put('/:slug', protect, loadPostBySlug, canModifyPost, validatePost, updatePost);
router.delete('/:slug', protect, loadPostBySlug, canModifyPost, deletePost);
router.post('/:slug/react', protect, toggleReaction);
router.post('/:slug/views', incrementViews);
router.put('/:slug/status', protect, authorize('admin'), setStatus);

module.exports = router;


