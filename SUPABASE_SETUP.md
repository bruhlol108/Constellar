# Supabase Database Setup Guide

## 🚀 Quick Start

### Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

✅ Your database is now set up!

---

## 📊 What Was Created

### `projects` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique project identifier (auto-generated) |
| `owner_id` | UUID | User who owns the project (references auth.users) |
| `title` | TEXT | Project name |
| `description` | TEXT | Optional project description |
| `canvas_data` | JSONB | Excalidraw canvas state (elements, appState, files) |
| `created_at` | TIMESTAMPTZ | When project was created |
| `updated_at` | TIMESTAMPTZ | When project was last updated (auto-updates) |

### Security (Row Level Security)

- ✅ Users can only see their own projects
- ✅ Users can only create projects for themselves
- ✅ Users can only update their own projects
- ✅ Users can only delete their own projects

---

## 🔌 API Endpoints

All endpoints require authentication (user must be signed in).

### Create a Project
```http
POST /api/projects
Content-Type: application/json

{
  "title": "My Workflow",
  "description": "Optional description",
  "canvas_data": {
    "elements": [],
    "appState": {},
    "files": {}
  }
}
```

### Get All Projects (for current user)
```http
GET /api/projects
```

Returns:
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "My Workflow",
      "description": "...",
      "canvas_data": {...},
      "created_at": "2025-10-18T...",
      "updated_at": "2025-10-18T..."
    }
  ]
}
```

### Get a Specific Project
```http
GET /api/projects/{project-id}
```

### Update a Project
```http
PUT /api/projects/{project-id}
Content-Type: application/json

{
  "title": "Updated Title",
  "canvas_data": {...}
}
```

### Delete a Project
```http
DELETE /api/projects/{project-id}
```

---

## 🎨 Integration with Excalidraw

### Saving Canvas State

```typescript
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

// Get current canvas state from Excalidraw
const saveProject = async (
  title: string,
  elements: readonly ExcalidrawElement[],
  appState: any,
  files: any
) => {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      canvas_data: {
        elements,
        appState,
        files,
      },
    }),
  });

  const data = await response.json();
  return data.project;
};
```

### Loading Canvas State

```typescript
const loadProject = async (projectId: string) => {
  const response = await fetch(`/api/projects/${projectId}`);
  const data = await response.json();

  // Use data.project.canvas_data to restore Excalidraw state
  const { elements, appState, files } = data.project.canvas_data;

  // Pass to Excalidraw component:
  // initialData={{ elements, appState, files }}
};
```

### Auto-Save (Update Existing Project)

```typescript
const autoSave = async (
  projectId: string,
  elements: readonly ExcalidrawElement[],
  appState: any,
  files: any
) => {
  await fetch(`/api/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      canvas_data: {
        elements,
        appState,
        files,
      },
    }),
  });
};
```

---

## 🧪 Testing

### Test the Demo Page

1. Make sure you're signed in
2. Go to: http://localhost:3000/projects
3. Try creating, editing, and deleting projects

### Test with Supabase Dashboard

1. Go to **Table Editor** → **projects**
2. You should see your created projects
3. Click on a row to see the JSON data stored in `canvas_data`

### Test API Directly (with curl)

First, get your access token:
```javascript
// In browser console on your app
const { data } = await supabase.auth.getSession();
console.log(data.session.access_token);
```

Then test the API:
```bash
# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title": "Test Project", "canvas_data": {}}'

# Get all projects
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎯 Next Steps for Your Hackathon

### Integrate with MCP (Claude AI)

Your AI workflow will:
1. Generate Excalidraw elements based on user prompts
2. Pass those elements to the canvas
3. Save the canvas state to Supabase

Example flow:
```
User: "Create a microservices architecture diagram"
  ↓
Claude MCP generates shapes/arrows
  ↓
Excalidraw renders them
  ↓
Save to Supabase via API
```

### Add to Your Excalidraw Page

When you build your main canvas page:
```typescript
import { Excalidraw } from "@excalidraw/excalidraw";

<Excalidraw
  initialData={loadedCanvasData}
  onChange={(elements, appState, files) => {
    // Auto-save to database
    autoSave(currentProjectId, elements, appState, files);
  }}
/>
```

---

## 🔧 Troubleshooting

### "Row Level Security" Errors
- Make sure you're signed in
- Check that `auth.uid()` matches the `owner_id` in your queries

### "Unauthorized" Errors
- Verify your Supabase credentials in `.env.local`
- Check that the user session is valid

### Cannot See Projects
- Run the SQL schema again
- Check RLS policies are enabled
- Verify you're querying with the correct user

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Excalidraw Docs](https://docs.excalidraw.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
