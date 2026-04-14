const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { validateComment } = require('../middleware/validation');
const { addComment, getComments, toggleReaction, updateComment, deleteComment, moderate, getAllComments } = require('../controllers/comment.controller');

// Admin route to get all comments - must be before /:postId
router.get('/', protect, authorize('admin'), getAllComments);
router.get('/:postId', getComments);
router.post('/', protect, validateComment, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/react', protect, toggleReaction);
router.put('/:id/moderate', protect, authorize('admin'), moderate);

module.exports = router;


