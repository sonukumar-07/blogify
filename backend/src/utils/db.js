const mongoose = require('mongoose');

async function connectDb() {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ CRITICAL: MONGO_URI environment variable is not set!');
    throw new Error('MONGO_URI not set in environment variables');
  }

  console.log('🔌 Attempting to connect to MongoDB...');
  console.log('📍 URI:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
  
  mongoose.set('strictQuery', true);
  
  // Add connection event listeners
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
  });

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).join(', ');
    if (collectionNames) {
      console.log('📚 Available collections:', collectionNames);
    } else {
      console.log('📚 No collections yet (will be created on first insert)');
    }
    
    // Show database connection info
    const isAtlas = mongoUri.includes('mongodb+srv://') || mongoUri.includes('mongodb.net');
    if (isAtlas) {
      console.log('☁️  Connected to MongoDB Atlas (Cloud)');
    } else {
      console.log('💻 Connected to MongoDB (Local)');
    }
    
    console.log('✅ Database connection established');
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('📝 Full error:', error);
    console.error('\n⚠️  Make sure your MONGO_URI is correct in .env file');
    console.error('   Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    throw error;
  }
}

module.exports = { connectDb };



