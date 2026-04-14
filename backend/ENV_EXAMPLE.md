PORT=5001
NODE_ENV=development

# MongoDB Atlas Connection String

# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Example: mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/ai_blog_platform?retryWrites=true&w=majority

# Get your connection string from: https://cloud.mongodb.com/

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai_blog_platform?retryWrites=true&w=majority

# JWT Secret (Change this to a random secure string)

JWT_SECRET=change_me_to_a_secure_random_string_for_production

# Frontend URL

FRONTEND_URL=http://localhost:5173

# Cloudinary (Optional - for image uploads)

# Get credentials from: https://cloudinary.com/

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Gemini AI (Optional - for AI content generation)

# Get free API key at: https://makersuite.google.com/app/apikey

GEMINI_API_KEY=
