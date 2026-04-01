#!/bin/bash

set -e

echo "AI-NGFW Development Setup"
echo "=========================="

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "Python version: $PYTHON_VERSION"

# Create virtual environment
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -e .

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "Node version: $NODE_VERSION"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend

if [ -f "pnpm-lock.yaml" ]; then
    echo "Using pnpm..."
    npm install -g pnpm
    pnpm install
elif [ -f "yarn.lock" ]; then
    echo "Using yarn..."
    yarn install
else
    echo "Using npm..."
    npm install
fi

cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=sqlite:///./ai_ngfw.db
REDIS_URL=redis://localhost:6379

# Groq API
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768

# HuggingFace
HUGGINGFACE_API_TOKEN=your_token_here

# FastAPI
API_TITLE=AI-NGFW API
API_VERSION=0.1.0
DEBUG=true

# Frontend
REACT_APP_API_URL=http://localhost:7860/api
EOF
    echo "Created .env file - please add your Groq API key"
else
    echo ".env file already exists"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Groq API key"
echo "2. Run the backend: python -m backend.main"
echo "3. In another terminal, run the frontend:"
echo "   cd frontend && npm run dev"
echo "4. Visit http://localhost:5173"
echo ""
