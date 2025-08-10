#!/bin/bash

# Apple Music Tagging App - Demo Launcher
echo "🎵 Apple Music Tagging App - Demo Mode"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Create mock environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Setting up mock environment..."
    cp backend/.env.mock backend/.env 2>/dev/null || {
        echo "USE_MOCK_DATA=true" > backend/.env
        echo "JWT_SECRET=mock_jwt_secret_for_demo_only" >> backend/.env
        echo "PORT=3001" >> backend/.env
        echo "NODE_ENV=development" >> backend/.env
    }
    echo "✅ Mock environment configured"
fi

# Install dependencies if node_modules don't exist
if [ ! -d "backend/node_modules" ] || [ ! -d "web/node_modules" ] || [ ! -d "mobile/node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "This may take a few minutes..."
    
    # Install backend dependencies
    echo "Installing backend dependencies..."
    cd backend && npm install --silent
    cd ..
    
    # Install web dependencies
    echo "Installing web dependencies..."
    cd web && npm install --silent
    cd ..
    
    # Install mobile dependencies
    echo "Installing mobile dependencies..."
    cd mobile && npm install --silent
    cd ..
    
    echo "✅ All dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Ready to launch demo!"
echo ""
echo "Please open 3 terminal windows and run these commands:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Web App):"
echo "  cd web && npm run dev"
echo ""
echo "Terminal 3 (Mobile App):"
echo "  cd mobile && npm start"
echo ""
echo "📖 For detailed instructions, see DEMO_README.md"
echo ""
echo "🌐 Web app will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:3001"
echo "📱 Mobile app will open with Expo"
echo ""
echo "✨ The demo includes:"
echo "   • 10 pre-loaded songs with realistic data"
echo "   • 5 sample tags with different colors"  
echo "   • Mock Apple Music import with 8 additional songs"
echo "   • Full authentication and tagging workflow"
echo ""
echo "Happy testing! 🎉"