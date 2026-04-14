const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { list, markRead } = require('../controllers/notification.controller');

router.get('/', protect, list);
router.put('/:id/read', protect, markRead);

module.exports = router;


