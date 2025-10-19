# 🤖 AI Integration Guide - Contextual Workflow Generation

This guide shows you how to integrate Gemini/Claude with full context awareness for your Excalidraw diagrams.

---

## 🎯 What You Get

Your AI will be **fully aware of**:
- ✅ All previous conversations
- ✅ Current canvas state (all elements)
- ✅ Version history
- ✅ Project metadata

This means when a user says "add a database", the AI knows what's already on the canvas!

---

## 🚀 Quick Start

### Step 1: Run the New SQL Migration

```bash
# In Supabase SQL Editor, run:
cat supabase-migration-ai-versions.sql
```

This creates:
- `ai_messages` table (conversation history)
- `project_versions` table (edit snapshots)
- Auto-versioning functions

### Step 2: Test the Context API

```bash
# Get all context for a project
GET /api/projects/{project-id}/context

# Returns:
{
  "context": {
    "project": { ... },
    "messages": [...],
    "latest_version": { ... },
    "stats": { ... }
  }
}
```

### Step 3: Send a Message with Context

```typescript
import { completeAIWorkflow } from '@/lib/ai/mcp-integration-example';

const result = await completeAIWorkflow(
  projectId,
  "Create a microservices architecture"
);

// AI will:
// 1. Read all previous messages
// 2. See current canvas
// 3. Generate response
// 4. Save conversation
// 5. Update canvas
// 6. Create version snapshot
```

---

## 📡 API Endpoints Reference

### Messages

```http
# Get conversation history
GET /api/projects/{id}/messages

# Add user or AI message
POST /api/projects/{id}/messages
{
  "role": "user" | "assistant" | "system",
  "content": "message text",
  "metadata": { optional extra data }
}
```

### Versions

```http
# Get version history
GET /api/projects/{id}/versions?limit=10

# Create version snapshot
POST /api/projects/{id}/versions
{
  "canvas_data": { elements, appState, files },
  "description": "Added database service"
}
```

### Context (The Key Endpoint!)

```http
# Get everything AI needs
GET /api/projects/{id}/context?messages=10

# Returns bundled:
- Project info
- Last 10 messages
- Current canvas state
- Latest version
- Stats
```

---

## 🧠 How AI Context Awareness Works

### The Flow:

```
User: "Add a database to the microservices diagram"
  ↓
Frontend: GET /api/projects/123/context
  ↓
Response: {
  messages: [
    { role: "user", content: "Create microservices architecture" },
    { role: "assistant", content: "Created API Gateway, Auth Service..." }
  ],
  project: {
    canvas_data: {
      elements: [
        { type: "rectangle", text: "API Gateway", x: 100, y: 100 },
        { type: "rectangle", text: "Auth Service", x: 350, y: 100 }
      ]
    }
  }
}
  ↓
Build Prompt: "Previous conversation: ... Current canvas has: API Gateway, Auth Service... User now wants: Add database"
  ↓
Send to Gemini/Claude
  ↓
AI Response: "I'll add a PostgreSQL database and connect it to the services..."
{
  "elements": [
    { type: "cylinder", text: "PostgreSQL", x: 225, y: 300 },
    { type: "arrow", start: "Auth Service", end: "PostgreSQL" }
  ]
}
  ↓
Save: Message → Update Canvas → Create Version
```

---

## 🔌 Integration Examples

### Example 1: Basic Chat Integration

```typescript
async function sendToAI(projectId: string, userMessage: string) {
  // 1. Get context
  const res = await fetch(`/api/projects/${projectId}/context`);
  const { context } = await res.json();

  // 2. Build prompt with full awareness
  const prompt = `
Project: ${context.project.title}
Current elements: ${context.stats.elements_count}

Previous conversation:
${context.messages.map(m => `${m.role}: ${m.content}`).join('\n')}

User's new request: ${userMessage}

Generate Excalidraw elements to fulfill this request.
  `;

  // 3. Send to your AI
  const aiResponse = await yourAIFunction(prompt);

  // 4. Save conversation
  await fetch(`/api/projects/${projectId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role: 'user', content: userMessage })
  });

  await fetch(`/api/projects/${projectId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role: 'assistant', content: aiResponse })
  });

  return aiResponse;
}
```

### Example 2: With Auto-Save & Versioning

```typescript
import { completeAIWorkflow } from '@/lib/ai/mcp-integration-example';

// This handles everything for you:
const result = await completeAIWorkflow(projectId, "Add a Redis cache");

// Automatically:
// ✅ Fetches context
// ✅ Sends to AI with full awareness
// ✅ Saves user + AI messages
// ✅ Extracts Excalidraw elements from response
// ✅ Updates canvas
// ✅ Creates version snapshot
```

### Example 3: Gemini API Integration

```typescript
async function sendToGemini(projectId: string, userMessage: string) {
  // Get context
  const res = await fetch(`/api/projects/${projectId}/context`);
  const { context } = await res.json();

  // Build prompt
  const prompt = buildAIPrompt(context, userMessage);

  // Call Gemini
  const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
```

---

## 🎨 React Component Example

```typescript
'use client';

import { useState, useEffect } from 'react';
import { completeAIWorkflow } from '@/lib/ai/mcp-integration-example';

export default function AIChat({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load conversation history
  useEffect(() => {
    fetch(`/api/projects/${projectId}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data.messages));
  }, [projectId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Send to AI with full context
      const result = await completeAIWorkflow(projectId, input);

      // Reload messages
      const res = await fetch(`/api/projects/${projectId}/messages`);
      const data = await res.json();
      setMessages(data.messages);

      setInput('');
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Chat history */}
      <div>
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'user-msg' : 'ai-msg'}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Tell AI what to create..."
        disabled={loading}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Generating...' : 'Send'}
      </button>
    </div>
  );
}
```

---

## 📊 Version History Example

```typescript
function VersionTimeline({ projectId }: { projectId: string }) {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/versions?limit=20`)
      .then(res => res.json())
      .then(data => setVersions(data.versions));
  }, [projectId]);

  const restoreVersion = async (versionId: string, canvasData: any) => {
    // Restore to this version
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvas_data: canvasData })
    });

    // Reload canvas
    window.location.reload();
  };

  return (
    <div>
      <h3>Version History</h3>
      {versions.map(v => (
        <div key={v.id}>
          <strong>v{v.version_number}</strong> - {v.description}
          <small>{new Date(v.created_at).toLocaleString()}</small>
          <button onClick={() => restoreVersion(v.id, v.canvas_data)}>
            Restore
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local

# For Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your-key-here

# For Claude (if using their API directly)
ANTHROPIC_API_KEY=your-key-here

# Your Supabase creds (already set)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🎯 Best Practices

### 1. Limit Message History
```typescript
// Only send last 10-20 messages to AI to avoid token limits
GET /api/projects/{id}/context?messages=10
```

### 2. Create Versions Strategically
```typescript
// Create versions on:
// - AI updates
// - User manual edits (debounced)
// - Major milestones

// Don't create on every tiny change (too many versions!)
```

### 3. Clean Up Old Messages (Optional)
```typescript
// Periodically archive very old messages if conversation gets too long
// Keep last 50-100 messages, archive the rest
```

### 4. Handle AI Errors Gracefully
```typescript
try {
  const result = await completeAIWorkflow(projectId, message);
} catch (error) {
  // Show user-friendly error
  // Log to error tracking service
  // Allow retry
}
```

---

## 🐛 Troubleshooting

### "Messages not showing up"
- Check RLS policies in Supabase
- Verify user owns the project
- Check browser console for errors

### "AI has no context"
- Verify context API returns data: `GET /api/projects/{id}/context`
- Check message limit parameter
- Ensure messages are being saved first

### "Versions not creating"
- Check if `create_version_snapshot` function exists in Supabase
- Verify RLS allows inserts
- Check for SQL errors in Supabase logs

---

## 📚 Next Steps

1. **Run the migration SQL** in Supabase
2. **Test the context API** with a project ID
3. **Implement AI integration** using the examples
4. **Add chat UI** to your canvas page
5. **Test version history** and restore functionality

---

## 🤝 For Your Hackathon

**Minimum viable implementation (30 mins):**
1. Run SQL migration ✅
2. Add simple chat input next to canvas
3. Use `completeAIWorkflow()` function
4. Show conversation history below

**Full implementation (2-3 hours):**
1. Beautiful chat UI with message bubbles
2. Loading states with animations
3. Version timeline with restore buttons
4. Error handling & retries
5. Excalidraw integration with live updates

You've got all the infrastructure - just connect it to your UI! 🚀
