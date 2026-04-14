const router = require('express').Router();
const { listMyPosts, getUserById } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/me/posts', protect, listMyPosts);
router.get('/:id', protect, getUserById);

module.exports = router;


