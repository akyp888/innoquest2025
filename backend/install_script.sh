#!/bin/bash

echo "🔧 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "📦 Installing dependencies..."
pip3 install --upgrade pip
pip3 install fastapi uvicorn pyyaml jinja2 python-multipart openai

echo "✅ Backend environment setup complete."
echo "🚀 You can now run the backend with: uvicorn main:app --reload"
