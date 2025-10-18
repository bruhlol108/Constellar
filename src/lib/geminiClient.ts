/**
 * Gemini API Client
 *
 * This module handles all communication with Google's Gemini AI API.
 * It's responsible for sending user prompts and receiving structured responses
 * that can include both conversational text and JSON actions for the whiteboard.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// System prompt that instructs Gemini how to respond with diagram actions
const SYSTEM_PROMPT = `You are an AI whiteboard assistant integrated into Constellar, an AI-powered diagramming tool.

When users describe diagrams, flowcharts, or visual concepts, you should:
1. Provide a helpful conversational response explaining what you're creating
2. Output a JSON object with structured "actions" that describe what to draw

IMPORTANT: Your response should contain BOTH:
- Natural language explanation (what you're doing and why)
- A JSON code block with the actions array

Example response format:
"I'll create a simple neural network diagram for you with three layers.

\`\`\`json
{
  "actions": [
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "Input Layer",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 80
    },
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "Hidden Layer",
      "x": 350,
      "y": 200,
      "width": 150,
      "height": 80
    },
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "Output Layer",
      "x": 600,
      "y": 200,
      "width": 150,
      "height": 80
    },
    {
      "type": "connect",
      "from": 0,
      "to": 1
    },
    {
      "type": "connect",
      "from": 1,
      "to": 2
    }
  ]
}
\`\`\`
"

Supported action types:
- create_shape: Creates a shape (rectangle, ellipse, diamond)
  - Required: type, shape, x, y
  - Optional: text, width, height, fillStyle, strokeColor
- create_text: Creates standalone text
  - Required: type, text, x, y
- connect: Creates an arrow between two elements
  - Required: type, from (index), to (index)
- create_arrow: Creates an arrow from point to point
  - Required: type, x, y, endX, endY

When users ask general questions or don't need visual elements, respond conversationally without JSON.`;

export interface GeminiMessage {
  role: "user" | "model";
  content: string;
}

export interface GeminiResponse {
  text: string;
  actions?: any[];
  hasActions: boolean;
}

/**
 * Initialize Gemini AI client
 * The API key should be stored in environment variables
 */
export function createGeminiClient(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
}

/**
 * Extract JSON actions from Gemini's response
 * Looks for JSON code blocks in the format ```json ... ```
 */
function extractActions(text: string): any[] | null {
  try {
    // Look for JSON code block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      return parsed.actions || null;
    }

    // Fallback: try to find any JSON object with an actions array
    const jsonObjectMatch = text.match(/\{[\s\S]*"actions"[\s\S]*\}/);
    if (jsonObjectMatch) {
      const parsed = JSON.parse(jsonObjectMatch[0]);
      return parsed.actions || null;
    }

    return null;
  } catch (error) {
    console.error("Failed to parse actions from response:", error);
    return null;
  }
}

/**
 * Send a message to Gemini and get a response
 *
 * @param apiKey - Google AI API key
 * @param prompt - User's message
 * @param history - Previous conversation messages (optional)
 * @returns Promise<GeminiResponse> containing text response and any actions
 */
export async function sendMessage(
  apiKey: string,
  prompt: string,
  history: GeminiMessage[] = []
): Promise<GeminiResponse> {
  try {
    const model = createGeminiClient(apiKey);

    // Start a chat session with history
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "Understood! I'm ready to help you create diagrams and visual elements on the whiteboard. Just describe what you'd like to see, and I'll generate both a helpful response and the necessary actions to create it on the canvas." }],
        },
        // Add conversation history
        ...history.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Send the user's message
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    // Extract actions if present
    const actions = extractActions(text);

    return {
      text,
      actions: actions || undefined,
      hasActions: actions !== null,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(
      `Failed to get response from Gemini: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKey(apiKey: string): boolean {
  return apiKey.length > 0 && apiKey.startsWith("AIzaSy");
}
