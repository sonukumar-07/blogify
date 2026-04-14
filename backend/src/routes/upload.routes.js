const router = require('express').Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../controllers/upload.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/image', protect, upload.single('file'), uploadImage);

module.exports = router;


