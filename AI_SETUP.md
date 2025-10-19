# 🤖 Constellar AI Integration Setup

Your teammate's AI code has been integrated! Here's how to use it:

## 🎯 What You Have Now

- **AI Chat Sidebar** on the canvas page (right side)
- **Gemini AI** that generates Excalidraw diagrams
- **Python MCP Server** that creates the actual diagram elements
- **Database storage** for all AI conversations

## 🔧 Setup Instructions

### 1. Get a Google API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add it to `.env.local`:
   ```bash
   GOOGLE_API_KEY=your_actual_key_here
   ```

### 2. Start the MCP Server

The Python backend needs to run alongside Next.js:

```bash
./start-mcp.sh
```

Or manually:
```bash
python3 mcp-server/server.py --api
```

This starts the server at `http://127.0.0.1:8000`

### 3. Start Next.js (if not running)

```bash
npm run dev
```

## 🎨 How to Use

1. Open any project from `/projects`
2. Click "Open Canvas"
3. See the **AI Chat Sidebar** on the right
4. Type prompts like:
   - "Create a user authentication flowchart"
   - "Draw a microservices architecture with API gateway, services, and database"
   - "Make a system design for a chat application"

5. AI generates diagrams **directly on the canvas**!

## 🛠️ What the AI Can Create

### Basic Shapes
- Rectangles, ellipses, diamonds
- Arrows and lines
- Text labels

### Advanced Diagrams
- **Flowcharts**: Simple vertical flows with steps
- **Advanced Flowcharts**: Decision nodes, branches, loops
- **System Architectures**: Full system diagrams with components (client, server, database, API, cache, queue, storage, service)

## 📁 Files Modified

- `/src/app/canvas/[id]/page.tsx` - Added AI chat sidebar
- `/src/app/api/chat/route.ts` - Gemini API integration (teammate's code)
- `/mcp-server/server.py` - Python backend for diagram generation (teammate's code)
- `.env.local` - Added GOOGLE_API_KEY and MCP_SERVER_URL

## 🚀 For Your Hackathon Demo

1. Start both servers:
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   ./start-mcp.sh
   ```

2. Navigate to canvas
3. Demo the AI creating diagrams in real-time
4. Show that conversations persist (stored in Supabase)

## 🎉 You're Done!

Your UI + Teammate's AI = Complete Hackathon Stack
