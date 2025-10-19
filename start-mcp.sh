#!/bin/bash

# Start the MCP Server for Excalidraw diagram generation

echo "🚀 Starting Constellar MCP Server..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it first."
    exit 1
fi

# Install dependencies if needed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install fastapi uvicorn fastmcp
fi

# Start the server in API mode
echo "✅ Starting MCP server on http://127.0.0.1:8000"
echo ""
python3 mcp-server/server.py --api
