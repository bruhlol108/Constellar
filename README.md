# Constellar

**AI-Powered Whiteboard for Intelligent Design**

Constellar is an intelligent whiteboard application that combines the power of AI with the intuitive hand-drawn aesthetics of Excalidraw. Simply describe what you want to create in natural language, and watch as diagrams, flowcharts, and system architectures materialize on your canvas.

## 🌟 Features

- ** AI-Powered Design**: Chat with AI to generate complex diagrams and visual architectures
- ** Natural Language Input**: Describe your vision in plain English - "create a web app architecture"
- ** Excalidraw Canvas**: Beautiful hand-drawn aesthetic with professional diagramming capabilities
- ** Real-Time Generation**: Watch your ideas transform into visual diagrams instantly
- ** Auto-Save**: Never lose your work with automatic project persistence
- ** Smart Elements**: AI understands shapes, connections, and layout optimization

## Tech Stack

### Frontend
- **Next.js 15.3.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling
- **Excalidraw** - Canvas and diagramming
- **Framer Motion** - Animations

### AI Integration
- **Gemini AI** (gemini-2.5-flash) - Natural language understanding
- **Model Context Protocol (MCP)** - Custom AI-to-canvas adapter

### Backend
- **Drizzle ORM** - Type-safe database queries
- **libSQL** - Serverless SQLite database
- **better-auth** - Authentication
- **Python MCP Server** - AI function calling backend

##  Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Python 3.8+ (for MCP server)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ThatParticularPencil/Constellar.git
cd Constellar
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:
```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Database (optional for local dev)
DATABASE_URL=your_database_url

# Add other environment variables as needed
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Optional: MCP Server Setup

For advanced AI features, set up the Python MCP server:

```bash
cd mcp-server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py --api
```

## 📖 Usage

1. **Sign In**: Create an account or sign in to access your workspace
2. **Create Project**: Start a new whiteboard canvas
3. **Chat with AI**: Use the sidebar to describe what you want to create
4. **Watch Magic Happen**: AI generates diagrams directly on your canvas
5. **Edit & Refine**: Manually adjust or ask AI for modifications

### Example Prompts

- "Create a system architecture for a full-stack web app"
- "Draw a flowchart for user authentication"
- "Make a network diagram with 3 servers and a load balancer"
- "Design a microservices architecture"

## Project Structure

```
Constellar/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── canvas/[id]/       # Canvas workspace
│   │   └── projects/          # Projects dashboard
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ChatSidebar.tsx   # AI chat interface
│   │   └── LandingPage.tsx   # Homepage
│   ├── lib/                   # Utilities and helpers
│   │   ├── ai/               # AI integration
│   │   └── mcpAdapter.ts     # MCP protocol adapter
│   └── contexts/             # React contexts
├── mcp-server/                # Python MCP server
└── public/                    # Static assets
```

## Key Components

- **ChatSidebar**: AI chat interface with conversation history
- **Canvas**: Excalidraw-powered drawing canvas
- **MCP Adapter**: Converts AI actions to canvas elements
- **Projects Dashboard**: Manage and organize your diagrams

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

See `.env.local.example` for all available environment variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Excalidraw](https://excalidraw.com/) - Amazing whiteboard library
- [Next.js](https://nextjs.org/) - React framework
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components

## Links

- **Live Demo**: [Coming Soon]
- **GitHub**: [https://github.com/ThatParticularPencil/Constellar](https://github.com/ThatParticularPencil/Constellar)
- **Documentation**: See `/docs` folder for detailed guides

---

Built by the Constellar team
