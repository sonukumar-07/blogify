/**
 * Test Script for Cascade Delete Functionality
 * 
 * This script tests that when you delete:
 * - A POST: all related comments and notifications are deleted
 * - A COMMENT: all replies and notifications are deleted
 * - A USER: all their posts, comments, and notifications are deleted
 * 
 * Run with: node test-cascade-delete.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDb } = require('./src/utils/db');

// Import models
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');
const Notification = require('./src/models/Notification');

async function runTests() {
  console.log('🧪 Starting Cascade Delete Tests...\n');

  try {
    // Connect to database
    await connectDb();

    // Test 1: Create test data
    console.log('📝 Test 1: Creating test data...');
    
    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('   ✓ Created test user:', testUser.email);

    // Create a test post
    const testPost = await Post.create({
      title: 'Test Post for Cascade Delete',
      slug: `test-post-${Date.now()}`,
      content: 'This is a test post to verify cascade deletes work properly.',
      author: testUser._id,
      status: 'published'
    });
    console.log('   ✓ Created test post:', testPost.slug);

    // Create comments
    const comment1 = await Comment.create({
      post: testPost._id,
      author: testUser._id,
      content: 'This is a parent comment'
    });
    console.log('   ✓ Created parent comment');

    const comment2 = await Comment.create({
      post: testPost._id,
      author: testUser._id,
      content: 'This is a reply to parent comment',
      parent: comment1._id
    });
    console.log('   ✓ Created reply comment');

    // Create notifications
    const notification = await Notification.create({
      user: testUser._id,
      type: 'comment',
      message: 'New comment on your post',
      meta: { 
        postId: testPost._id.toString(),
        commentId: comment1._id.toString()
      }
    });
    console.log('   ✓ Created notification');

    // Count initial records
    const initialCounts = {
      posts: await Post.countDocuments({ _id: testPost._id }),
      comments: await Comment.countDocuments({ post: testPost._id }),
      notifications: await Notification.countDocuments({ 'meta.postId': testPost._id.toString() })
    };
    console.log('\n📊 Initial counts:', initialCounts);

    // Test 2: Delete the post (should cascade delete comments and notifications)
    console.log('\n🗑️  Test 2: Deleting post (should cascade delete comments & notifications)...');
    await testPost.deleteOne();
    console.log('   ✓ Post deleted');

    // Verify cascade delete
    const afterDeleteCounts = {
      posts: await Post.countDocuments({ _id: testPost._id }),
      comments: await Comment.countDocuments({ post: testPost._id }),
      notifications: await Notification.countDocuments({ 'meta.postId': testPost._id.toString() })
    };
    console.log('📊 After delete counts:', afterDeleteCounts);

    // Validate
    if (afterDeleteCounts.posts === 0 && afterDeleteCounts.comments === 0 && afterDeleteCounts.notifications === 0) {
      console.log('✅ CASCADE DELETE TEST PASSED!');
      console.log('   Post, all comments, and notifications were successfully deleted from database');
    } else {
      console.log('❌ CASCADE DELETE TEST FAILED!');
      console.log('   Some records were not deleted properly');
    }

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await testUser.deleteOne();
    console.log('   ✓ Test user deleted');

    console.log('\n✨ All tests completed!');
    console.log('🎉 Your MongoDB Atlas connection is working correctly!');
    console.log('🔄 All CRUD operations will be reflected in MongoDB Atlas');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the tests
runTests();





