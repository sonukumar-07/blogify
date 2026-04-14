const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
    category: { type: String, index: true },
    tags: [{ type: String, index: true }],
    summary: { type: String },
    readingTimeMinutes: { type: Number, default: 1 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'draft' },
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track unique viewers
    metaDescription: { type: String },
    moderationReason: { type: String },
  },
  { timestamps: true }
);

// Cascade delete: Delete all comments when a post is deleted
postSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Comment = mongoose.model('Comment');
    const Notification = mongoose.model('Notification');
    
    console.log(`🗑️  Cascading delete for post: ${this.slug}`);
    
    // Delete all comments associated with this post
    const deletedComments = await Comment.deleteMany({ post: this._id });
    console.log(`   ✓ Deleted ${deletedComments.deletedCount} comments`);
    
    // Delete all notifications associated with this post
    const deletedNotifications = await Notification.deleteMany({ 
      'meta.postId': this._id.toString() 
    });
    console.log(`   ✓ Deleted ${deletedNotifications.deletedCount} notifications`);
    
    next();
  } catch (error) {
    console.error('❌ Error in post cascade delete:', error);
    next(error);
  }
});

// Also handle findOneAndDelete
postSchema.pre('findOneAndDelete', async function(next) {
  try {
    const Comment = mongoose.model('Comment');
    const Notification = mongoose.model('Notification');
    const doc = await this.model.findOne(this.getFilter());
    
    if (doc) {
      console.log(`🗑️  Cascading delete for post: ${doc.slug}`);
      
      const deletedComments = await Comment.deleteMany({ post: doc._id });
      console.log(`   ✓ Deleted ${deletedComments.deletedCount} comments`);
      
      const deletedNotifications = await Notification.deleteMany({ 
        'meta.postId': doc._id.toString() 
      });
      console.log(`   ✓ Deleted ${deletedNotifications.deletedCount} notifications`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in post cascade delete:', error);
    next(error);
  }
});

module.exports = mongoose.model('Post', postSchema);



