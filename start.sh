#!/bin/bash

echo "🚀 Starting personal dictionary..."
echo "📦 Installing dependencies..."

npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
    echo "🌐 Starting development server on http://localhost:5173"
    echo "📚 Application will be available shortly..."
    
    npm run dev
else
    echo "❌ Error installing dependencies"
    exit 1
fi
