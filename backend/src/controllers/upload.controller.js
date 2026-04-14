const { configureCloudinary } = require('../utils/cloudinary');
const { Readable } = require('stream');

async function uploadImage(req, res, next) {
  try {
    console.log('Upload request received. File:', req.file ? req.file.originalname : 'None');
    if (!req.file) { 
      res.status(400); 
      throw new Error('No file uploaded'); 
    }
    
    const cloudinary = configureCloudinary();
    console.log('Cloudinary configured. Uploading file...');
    
    // Create upload stream with callback
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'ai-blog-platform',
        resource_type: 'auto'
      },
      (error, uploadResult) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return next(error);
        }
        console.log('Upload successful! URL:', uploadResult.secure_url);
        return res.status(201).json({ 
          url: uploadResult.secure_url, 
          public_id: uploadResult.public_id 
        });
      }
    );
    
    // Convert buffer to stream using Node.js built-in Readable
    const bufferStream = Readable.from(req.file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (e) { 
    console.error('Upload controller error:', e);
    next(e); 
  }
}

module.exports = { uploadImage };



