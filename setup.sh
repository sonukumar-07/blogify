#!/bin/bash

echo "🤖 AI Blog Platform Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_success "Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm is installed: $(npm --version)"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if npm install; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend
if npm install; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Create environment files if they don't exist
print_status "Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/ENV_EXAMPLE.md backend/.env
    print_warning "Created backend/.env from template. Please edit it with your values."
else
    print_success "Backend .env file already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/ENV_EXAMPLE.md frontend/.env
    print_warning "Created frontend/.env from template. Please edit it with your values."
else
    print_success "Frontend .env file already exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your MongoDB URI, JWT secret, and API keys"
echo "2. Edit frontend/.env with your backend API URL"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "Required environment variables:"
echo "Backend (.env):"
echo "  - MONGO_URI (MongoDB connection string)"
echo "  - JWT_SECRET (Random secret key)"
echo "  - OPENAI_API_KEY (OpenAI API key)"
echo "  - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
echo ""
echo "Frontend (.env):"
echo "  - VITE_API_URL (Backend API URL, e.g., http://localhost:5000/api)"
echo ""
echo "For detailed setup instructions, see README.md"
echo "For deployment guide, see DEPLOYMENT.md"
