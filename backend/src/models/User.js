const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 500 },
    social: {
      website: String,
      twitter: String,
      github: String,
      linkedin: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Cascade delete: When user is deleted, delete all their content
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Post = mongoose.model('Post');
    const Comment = mongoose.model('Comment');
    const Notification = mongoose.model('Notification');
    
    console.log(`🗑️  Cascading delete for user: ${this.email}`);
    
    // Delete all posts by this user (which will cascade to comments via Post model)
    const deletedPosts = await Post.deleteMany({ author: this._id });
    console.log(`   ✓ Deleted ${deletedPosts.deletedCount} posts`);
    
    // Delete all comments by this user
    const deletedComments = await Comment.deleteMany({ author: this._id });
    console.log(`   ✓ Deleted ${deletedComments.deletedCount} comments`);
    
    // Delete all notifications for this user
    const deletedNotifications = await Notification.deleteMany({ user: this._id });
    console.log(`   ✓ Deleted ${deletedNotifications.deletedCount} notifications`);
    
    next();
  } catch (error) {
    console.error('❌ Error in user cascade delete:', error);
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);



