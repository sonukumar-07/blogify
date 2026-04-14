const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { list, create, update, remove } = require('../controllers/category.controller');

router.get('/', list);
router.post('/', protect, authorize('admin'), create);
router.put('/:id', protect, authorize('admin'), update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;


