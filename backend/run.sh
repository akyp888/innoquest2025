#!/bin/bash

# Activate the virtual environment
echo "🐍 Activating virtual environment..."
source venv/bin/activate

# Run FastAPI with uvicorn
echo "🚀 Launching FastAPI backend..."
uvicorn main:app --reload
