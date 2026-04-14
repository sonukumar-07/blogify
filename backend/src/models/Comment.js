const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['visible', 'hidden'], default: 'visible' },
  },
  { timestamps: true }
);

// Cascade delete: Delete all child comments when a parent comment is deleted
commentSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Comment = mongoose.model('Comment');
    const Notification = mongoose.model('Notification');
    
    console.log(`🗑️  Cascading delete for comment: ${this._id}`);
    
    // Delete all child comments (replies)
    const deletedReplies = await Comment.deleteMany({ parent: this._id });
    console.log(`   ✓ Deleted ${deletedReplies.deletedCount} reply comments`);
    
    // Delete notifications related to this comment
    const deletedNotifications = await Notification.deleteMany({ 
      'meta.commentId': this._id.toString() 
    });
    console.log(`   ✓ Deleted ${deletedNotifications.deletedCount} notifications`);
    
    next();
  } catch (error) {
    console.error('❌ Error in comment cascade delete:', error);
    next(error);
  }
});

// Also handle findOneAndDelete
commentSchema.pre('findOneAndDelete', async function(next) {
  try {
    const Comment = mongoose.model('Comment');
    const Notification = mongoose.model('Notification');
    const doc = await this.model.findOne(this.getFilter());
    
    if (doc) {
      console.log(`🗑️  Cascading delete for comment: ${doc._id}`);
      
      const deletedReplies = await Comment.deleteMany({ parent: doc._id });
      console.log(`   ✓ Deleted ${deletedReplies.deletedCount} reply comments`);
      
      const deletedNotifications = await Notification.deleteMany({ 
        'meta.commentId': doc._id.toString() 
      });
      console.log(`   ✓ Deleted ${deletedNotifications.deletedCount} notifications`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in comment cascade delete:', error);
    next(error);
  }
});

module.exports = mongoose.model('Comment', commentSchema);



