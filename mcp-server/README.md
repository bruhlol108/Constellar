# Constellar MCP Server

A FastMCP server that provides tools for generating Excalidraw canvas elements through Claude.

## Overview

This MCP server exposes tools that allow Claude to programmatically create shapes, arrows, text, and complete diagrams on an Excalidraw canvas. All elements are generated with the proper Excalidraw JSON schema.

## Available Tools

### Basic Shapes

**`create_rectangle`**
- Creates a rectangle with optional label
- Parameters: position (x, y), dimensions (width, height), styling (colors, stroke, fill)
- Returns: Excalidraw rectangle element(s)

**`create_ellipse`**
- Creates an ellipse/circle with optional label
- Parameters: position (x, y), dimensions (width, height), styling
- Returns: Excalidraw ellipse element(s)

**`create_diamond`**
- Creates a diamond shape with optional label
- Parameters: position (x, y), dimensions (width, height), styling
- Returns: Excalidraw diamond element(s)

### Connectors

**`create_arrow`**
- Creates an arrow between two points
- Parameters: start point (startX, startY), end point (endX, endY), arrowhead styles, optional label
- Returns: Excalidraw arrow element(s)

**`create_line`**
- Creates a simple line between two points
- Parameters: start point (startX, startY), end point (endX, endY), styling
- Returns: Excalidraw line element

### Text

**`create_text_standalone`**
- Creates standalone text on the canvas
- Parameters: position (x, y), text content, font size, alignment, color
- Returns: Excalidraw text element

### Complex Diagrams

**`create_flowchart`**
- Creates a complete vertical flowchart
- Parameters: title, list of steps, positioning, spacing
- Returns: Multiple connected Excalidraw elements (diamonds, rectangles, arrows)

## Color Palette (Space Theme)

The server uses Constellar's purple/violet theme by default:
- Primary: `#8b5cf6` (purple)
- Secondary: `#a78bfa` (light purple)
- Accent: `#c4b5fd` (lighter purple)
- Text: `#e9ecef` (light gray)

## Installation

### 1. Set up environment variables

```bash
cd mcp-server
cp .env.example .env
```

Then edit `.env` and add your Google API key:
```
GOOGLE_API_KEY=your_actual_api_key_here
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "constellar": {
      "command": "python",
      "args": ["/path/to/Constellar/mcp-server/server.py"]
    }
  }
}
```

## Example Usage

Once connected, you can ask Claude:

- "Create a blue rectangle at position 100, 100 with the label 'API Server'"
- "Draw an arrow from 150, 150 to 300, 300 with the label 'requests'"
- "Create a flowchart titled 'User Login' with steps: Enter credentials, Validate, Check database, Grant access"
- "Make an ellipse at 200, 200 with purple background"

Claude will use the appropriate tools to generate valid Excalidraw JSON that can be rendered on your canvas.

## Element Schema

All elements follow the Excalidraw element schema with:
- Unique IDs (auto-generated)
- Proper positioning and dimensions
- Styling properties (colors, strokes, fills)
- Hand-drawn roughness
- Support for labels and text containers
- Element bindings for arrows and connectors

## Development

The server uses FastMCP for easy tool definition and automatic schema generation. Each tool is decorated with `@mcp.tool()` and includes full type hints and documentation.

Run the server directly:
```bash
python server.py
```
