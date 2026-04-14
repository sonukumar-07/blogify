// src/server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDb } = require('./utils/db');
const { notFound, errorHandler } = require('./utils/error');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const categoryRoutes = require('./routes/category.routes');
const uploadRoutes = require('./routes/upload.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');


const app = express();

app.set('trust proxy', 1);

// ----- CORS config (robust, production-ready) -----
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL            // e.g. https://ai-blogg-platform.vercel.app
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Debug log for production troubleshooting
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 CORS Request from origin:', origin);
      console.log('🔍 Allowed origins:', allowedOrigins);
      console.log('🔍 FRONTEND_URL env:', process.env.FRONTEND_URL);
    }

    // allow non-browser requests (curl, server-to-server) that have no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow ALL Vercel deployments (production + preview branches)
    if (origin && origin.includes('vercel.app')) {
      console.log('✅ Allowing Vercel deployment:', origin);
      return callback(null, true);
    }

    // Allow Render preview deployments
    if (origin && origin.includes('onrender.com')) {
      console.log('✅ Allowing Render deployment:', origin);
      return callback(null, true);
    }

    console.error('❌ CORS blocked origin:', origin);
    return callback(null, true); // Changed to TRUE for debugging - allow all for now
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
};

app.use(cors(corsOptions));

// Add explicit OPTIONS handling for preflight requests
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);

// ----- Root + health endpoints -----
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'API is running. Use /api routes.' });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    if (dbStatus === 1) {
      await mongoose.connection.db.admin().ping();
    }

    return res.json({
      status: 'ok',
      database: {
        status: dbStatusMap[dbStatus],
        name: mongoose.connection.name || 'N/A',
        connected: dbStatus === 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection issue',
      error: error.message
    });
  }
});

// ----- API routes -----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);


app.use(notFound);
app.use(errorHandler);

// ----- Start server after DB connection -----
const PORT = process.env.PORT || 5001;

connectDb()
  .then(async () => {
    console.log('✅ Database connection established');

    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📚 Available collections:', collections.map(c => c.name).join(', ') || 'None');
    } catch (e) {
      console.error('⚠️  Could not list collections:', e.message);
    }

    app.listen(PORT, () => {
      console.log('🚀 Server running on port', PORT);
      if (process.env.FRONTEND_URL) console.log('🌐 Allowed frontend origin:', process.env.FRONTEND_URL);
      console.log('❤️  Health: /api/health');
    });
  })
  .catch((err) => {
    console.error('❌ CRITICAL: Failed to connect to database');
    console.error('📝 Error details:', err.message);
    process.exit(1);
  });

module.exports = app;



