import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const BACKEND_URL = process.env.MCP_SERVER_URL || "http://127.0.0.1:8000";

// Define function declarations for Gemini (matching MCP server tools)
const tools = [
  {
    name: "create_rectangle",
    description: "Create a rectangle shape on the Excalidraw canvas",
    parameters: {
      type: "object",
      properties: {
        x: { type: "number", description: "X coordinate of top-left corner" },
        y: { type: "number", description: "Y coordinate of top-left corner" },
        width: { type: "number", description: "Width of rectangle (default 200)" },
        height: { type: "number", description: "Height of rectangle (default 100)" },
        strokeColor: { type: "string", description: "Border color in hex (default #8b5cf6)" },
        backgroundColor: { type: "string", description: "Fill color in hex or 'transparent'" },
        label: { type: "string", description: "Optional text label inside the rectangle" },
      },
      required: ["x", "y"],
    },
  },
  {
    name: "create_ellipse",
    description: "Create an ellipse/circle shape on the Excalidraw canvas",
    parameters: {
      type: "object",
      properties: {
        x: { type: "number", description: "X coordinate of center" },
        y: { type: "number", description: "Y coordinate of center" },
        width: { type: "number", description: "Width of ellipse (default 150)" },
        height: { type: "number", description: "Height of ellipse (default 150)" },
        strokeColor: { type: "string", description: "Border color in hex" },
        backgroundColor: { type: "string", description: "Fill color in hex" },
        label: { type: "string", description: "Optional text label inside the ellipse" },
      },
      required: ["x", "y"],
    },
  },
  {
    name: "create_diamond",
    description: "Create a diamond shape on the Excalidraw canvas",
    parameters: {
      type: "object",
      properties: {
        x: { type: "number", description: "X coordinate of top-left corner" },
        y: { type: "number", description: "Y coordinate of top-left corner" },
        width: { type: "number", description: "Width of diamond (default 150)" },
        height: { type: "number", description: "Height of diamond (default 150)" },
        strokeColor: { type: "string", description: "Border color in hex" },
        backgroundColor: { type: "string", description: "Fill color in hex" },
        label: { type: "string", description: "Optional text label inside the diamond" },
      },
      required: ["x", "y"],
    },
  },
  {
    name: "create_arrow",
    description: "Create an arrow connecting two points on the Excalidraw canvas",
    parameters: {
      type: "object",
      properties: {
        startX: { type: "number", description: "X coordinate of arrow start point" },
        startY: { type: "number", description: "Y coordinate of arrow start point" },
        endX: { type: "number", description: "X coordinate of arrow end point" },
        endY: { type: "number", description: "Y coordinate of arrow end point" },
        strokeColor: { type: "string", description: "Arrow color in hex" },
        label: { type: "string", description: "Optional text label on the arrow" },
      },
      required: ["startX", "startY", "endX", "endY"],
    },
  },
  {
    name: "create_line",
    description: "Create a line connecting two points on the Excalidraw canvas",
    parameters: {
      type: "object",
      properties: {
        startX: { type: "number", description: "X coordinate of line start point" },
        startY: { type: "number", description: "Y coordinate of line start point" },
        endX: { type: "number", description: "X coordinate of line end point" },
        endY: { type: "number", description: "Y coordinate of line end point" },
        strokeColor: { type: "string", description: "Line color in hex" },
      },
      required: ["startX", "startY", "endX", "endY"],
    },
  },
  {
    name: "create_text_standalone",
    description: "Create standalone text on the Excalidraw canvas",
    parameters: {
      type: "object",
      properties: {
        x: { type: "number", description: "X coordinate of text position" },
        y: { type: "number", description: "Y coordinate of text position" },
        text: { type: "string", description: "The text content to display" },
        fontSize: { type: "number", description: "Font size in pixels (default 20)" },
        strokeColor: { type: "string", description: "Text color in hex" },
      },
      required: ["x", "y", "text"],
    },
  },
  {
    name: "create_flowchart",
    description: "Create a vertical flowchart with connected boxes",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title for the flowchart" },
        steps: {
          type: "array",
          items: { type: "string" },
          description: "List of step descriptions",
        },
        x: { type: "number", description: "Starting X coordinate (default 100)" },
        y: { type: "number", description: "Starting Y coordinate (default 100)" },
      },
      required: ["title", "steps"],
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Initialize Gemini model with function calling
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: tools }],
    });

    // Convert messages to Gemini format
    const lastMessage = messages[messages.length - 1];
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Google Gemini requires first message in history to be from "user"
    // Remove any leading "model" messages (like welcome messages)
    while (history.length > 0 && history[0].role === "model") {
      history = history.slice(1);
    }

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    // System prompt for Excalidraw generation
    const systemContext = `You are an AI assistant integrated into Constellar, an AI-enabled whiteboard for engineers. You help users create diagrams and visualizations using Excalidraw.

You have access to tools for creating shapes:
- create_rectangle: rectangles with optional labels
- create_ellipse: circles/ellipses with optional labels
- create_diamond: diamond shapes with optional labels
- create_arrow: arrows between points with optional labels
- create_line: simple lines between points
- create_text_standalone: standalone text
- create_flowchart: complete flowcharts with title and steps

Use purple theme colors: #8b5cf6 (primary), #a78bfa (secondary), #c4b5fd (light)

When users ask you to create shapes, use the appropriate tools. After calling tools, provide a friendly response explaining what you created.`;

    const enhancedPrompt = `${systemContext}\n\nUser: ${lastMessage.content}`;

    // Send message and get response
    const result = await chat.sendMessage(enhancedPrompt);
    const response = result.response;

    // Handle function calls
    const functionCalls = response.functionCalls();
    let allElements: any[] = [];
    let toolActions: any[] = [];

    if (functionCalls && functionCalls.length > 0) {
      console.group(`🤖 [API] Gemini Function Calling`);
      console.log(`📋 Executing ${functionCalls.length} function call(s)`);

      // Execute each function call
      for (const call of functionCalls) {
        console.group(`🔧 Tool: ${call.name}`);
        console.log("📥 Input:", call.args);

        try {
          const elements = await executeTool(call.name, call.args);
          console.log(`✅ Generated ${elements.length} Excalidraw element(s)`);
          console.log("📤 Output:", elements);

          allElements.push(...elements);
          toolActions.push({
            type: call.name,
            ...call.args,
          });
        } catch (error) {
          console.error(`❌ Error calling tool ${call.name}:`, error);
          // Continue with other tools even if one fails
        }
        console.groupEnd();
      }

      console.log(`\n📊 Summary: Generated ${allElements.length} total element(s)`);
      console.groupEnd();

      // Send function responses back to get natural language response
      const functionResponses = functionCalls.map((call) => ({
        functionResponse: {
          name: call.name,
          response: { success: true },
        },
      }));

      const result2 = await chat.sendMessage(functionResponses);
      const finalText = result2.response.text();

      return NextResponse.json({
        message: finalText,
        role: "assistant",
        elements: allElements,
        toolCalls: toolActions,
      });
    }

    // No function calls, just return text response
    const text = response.text();
    return NextResponse.json({
      message: text,
      role: "assistant",
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}

async function executeTool(toolName: string, args: any): Promise<any[]> {
  try {
    // Call the Python backend REST API
    const response = await fetch(`${BACKEND_URL}/tools/${toolName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const result = await response.json();

    // Extract elements from response
    if (result && result.elements) {
      return result.elements;
    }

    throw new Error("No elements in backend response");
  } catch (error) {
    console.error(`Error calling MCP backend:`, error);
    return [];
  }
}
