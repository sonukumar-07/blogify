# 🤖 AI Blog Platform

A full-featured AI-powered blog platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring AI-assisted content generation, user authentication, moderation, and modern UI.

## ✨ Features

### 🔐 Authentication & Authorization

- User registration and login with JWT
- Role-based access (Admin/User)
- Password hashing with bcrypt
- Protected routes and middleware

### 📝 Blog Management

- Create, edit, delete, and publish blog posts
- Rich text editor (React Quill)
- SEO-friendly slugs and meta descriptions
- Cover image uploads (Cloudinary)
- Reading time estimation
- Post moderation system

### 🤖 AI Content Generation

- OpenAI integration for content creation
- AI-generated summaries and meta descriptions
- Suggested tags and categories
- Editable AI-generated content

### 💬 Engagement Features

- Nested comment system
- Like/dislike functionality
- Real-time notifications
- Search and filtering
- Category management

### 📊 Analytics & Dashboards

- User dashboard with post statistics
- Admin panel for moderation
- View counts and engagement metrics
- Platform-wide analytics

### 🎨 Modern UI/UX

- Responsive design with Tailwind CSS
- Dark/light mode support
- Smooth animations and transitions
- Mobile-first approach

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key
- Cloudinary account (for image uploads)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd AI-Blogg-Platform
```

### 2. Backend Setup

```bash
cd backend
npm install
cp ENV_EXAMPLE.md .env
# Edit .env with your values
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp ENV_EXAMPLE.md .env
# Edit .env with your values
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ai_blog_platform
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
AI-Blogg-Platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, validation, security
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # AI service
│   │   ├── utils/           # Database, error handling
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── ENV_EXAMPLE.md
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (auth)
│   │   ├── lib/             # API client
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── ENV_EXAMPLE.md
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Posts

- `GET /api/posts` - Get all posts (with filters)
- `POST /api/posts` - Create new post
- `GET /api/posts/:slug` - Get post by slug
- `PUT /api/posts/:slug` - Update post
- `DELETE /api/posts/:slug` - Delete post
- `POST /api/posts/:slug/react` - Like/dislike post
- `POST /api/posts/:slug/views` - Increment view count
- `PUT /api/posts/:slug/status` - Update post status (admin)

### Comments

- `GET /api/comments/:postId` - Get post comments
- `POST /api/comments` - Add comment
- `POST /api/comments/:id/react` - Like/dislike comment
- `PUT /api/comments/:id/moderate` - Moderate comment (admin)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### AI & Upload

- `POST /api/ai/generate` - Generate AI content
- `POST /api/upload/image` - Upload image
- `GET /api/search` - Search posts

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### Building for Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 🚀 Deployment

### Backend (Render/Heroku)

1. Connect your repository
2. Set environment variables
3. Deploy

### Frontend (Vercel/Netlify)

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables
5. Deploy

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation with express-validator
- XSS protection
- MongoDB injection protection
- Rate limiting
- CORS configuration
- Helmet security headers

## 🤖 AI Integration

The platform integrates with OpenAI's GPT models to provide:

- Content generation from prompts
- Automatic summaries
- SEO meta descriptions
- Tag suggestions
- Category recommendations

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS framework
- Smooth animations
- Touch-friendly interface
- Cross-browser compatibility

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support, email support@aiblogplatform.com or create an issue in the repository.

---

Built with ❤️ using MERN stack and AI
