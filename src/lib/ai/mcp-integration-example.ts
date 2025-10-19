/**
 * MCP Integration Examples
 * Shows how to integrate with Claude/Gemini using the context API
 *
 * This file contains example code - adapt it for your actual MCP setup
 */

import { buildAIPrompt, formatMessagesForAPI, extractElementsFromAIResponse } from "./prompt-builder";

// ============================================
// EXAMPLE 1: Simple AI Request with Context
// ============================================

export async function sendMessageToAI(
  projectId: string,
  userMessage: string
): Promise<{ aiResponse: string; elements: any[] | null }> {

  // Step 1: Get full context from your database
  const contextResponse = await fetch(`/api/projects/${projectId}/context`);
  const { context } = await contextResponse.json();

  // Step 2: Build comprehensive prompt with context
  const prompt = buildAIPrompt(context, userMessage);

  // Step 3: Send to your AI (Claude MCP, Gemini, etc.)
  // Replace this with your actual AI API call
  const aiResponse = await callYourAI(prompt);

  // Step 4: Save user message to database
  await fetch(`/api/projects/${projectId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "user",
      content: userMessage,
    }),
  });

  // Step 5: Save AI response to database
  await fetch(`/api/projects/${projectId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "assistant",
      content: aiResponse,
    }),
  });

  // Step 6: Extract Excalidraw elements from AI response
  const elements = extractElementsFromAIResponse(aiResponse);

  // Step 7: If AI generated elements, update the canvas
  if (elements && elements.length > 0) {
    // Merge with existing elements
    const updatedCanvasData = {
      ...context.project.canvas_data,
      elements: [...(context.project.canvas_data.elements || []), ...elements],
    };

    // Update project with new canvas data
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canvas_data: updatedCanvasData,
      }),
    });

    // Create a version snapshot
    await fetch(`/api/projects/${projectId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canvas_data: updatedCanvasData,
        description: `AI update: ${userMessage.slice(0, 50)}...`,
      }),
    });
  }

  return { aiResponse, elements };
}

// ============================================
// EXAMPLE 2: Claude MCP Integration
// ============================================

/**
 * Example using Claude MCP Server
 * Assumes you have an MCP server set up
 */
export async function sendToClaudeMCP(
  projectId: string,
  userMessage: string
): Promise<string> {

  // Get context
  const contextResponse = await fetch(`/api/projects/${projectId}/context`);
  const { context } = await contextResponse.json();

  // Format messages for Claude API
  const messages = formatMessagesForAPI(context, userMessage);

  // Call your Claude MCP server
  const response = await fetch("YOUR_MCP_SERVER_URL/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add your API key if needed
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      messages: messages,
      max_tokens: 4096,
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}

// ============================================
// EXAMPLE 3: Google Gemini Integration
// ============================================

/**
 * Example using Google Gemini API
 */
export async function sendToGemini(
  projectId: string,
  userMessage: string
): Promise<string> {

  // Get context
  const contextResponse = await fetch(`/api/projects/${projectId}/context`);
  const { context } = await contextResponse.json();

  // Build prompt
  const prompt = buildAIPrompt(context, userMessage);

  // Call Gemini API
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ============================================
// EXAMPLE 4: Complete Workflow with Auto-Save
// ============================================

/**
 * Full workflow: Get context → Send to AI → Save conversation → Update canvas → Create version
 */
export async function completeAIWorkflow(
  projectId: string,
  userMessage: string
) {
  try {
    // 1. Get full context
    const contextResponse = await fetch(`/api/projects/${projectId}/context`);
    const { context } = await contextResponse.json();

    console.log("Context loaded:", {
      messagesCount: context.messages.length,
      elementsCount: context.stats.elements_count,
    });

    // 2. Save user message first
    await fetch(`/api/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "user",
        content: userMessage,
      }),
    });

    // 3. Build prompt and send to AI
    const prompt = buildAIPrompt(context, userMessage);

    // Replace with your actual AI call (Claude MCP, Gemini, etc.)
    const aiResponse = await callYourAI(prompt);

    // 4. Save AI response
    await fetch(`/api/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "assistant",
        content: aiResponse,
        metadata: {
          timestamp: new Date().toISOString(),
          model: "your-model-name",
        },
      }),
    });

    // 5. Extract and apply Excalidraw elements
    const elements = extractElementsFromAIResponse(aiResponse);

    if (elements && elements.length > 0) {
      // Merge with existing canvas
      const updatedCanvasData = {
        elements: [...(context.project.canvas_data.elements || []), ...elements],
        appState: context.project.canvas_data.appState || {},
        files: context.project.canvas_data.files || {},
      };

      // Update project
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvas_data: updatedCanvasData,
        }),
      });

      // Create version snapshot
      await fetch(`/api/projects/${projectId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvas_data: updatedCanvasData,
          description: `AI: ${userMessage.slice(0, 50)}${userMessage.length > 50 ? "..." : ""}`,
        }),
      });

      console.log(`Added ${elements.length} new elements to canvas`);
    }

    return {
      success: true,
      aiResponse,
      elementsAdded: elements?.length || 0,
    };
  } catch (error) {
    console.error("AI workflow error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// Placeholder for your actual AI call
// Replace this with your real implementation
// ============================================

async function callYourAI(prompt: string): Promise<string> {
  // This is where you'd call your actual AI
  // Examples:
  // - Claude MCP Server
  // - Gemini API
  // - OpenAI API
  // - Local LLM via Ollama
  // etc.

  console.log("Sending to AI:", prompt.slice(0, 200) + "...");

  // Placeholder response
  return `I'll create a microservices architecture with the following components...

{
  "elements": [
    {
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "text": "API Gateway",
      "strokeColor": "#000000",
      "backgroundColor": "#a5d8ff"
    }
  ]
}`;
}

// ============================================
// USAGE IN YOUR REACT COMPONENT
// ============================================

/**
 * Example usage in a React component:
 *
 * import { completeAIWorkflow } from '@/lib/ai/mcp-integration-example';
 *
 * function ChatInterface({ projectId }) {
 *   const [userInput, setUserInput] = useState('');
 *   const [loading, setLoading] = useState(false);
 *
 *   const handleSend = async () => {
 *     setLoading(true);
 *     try {
 *       const result = await completeAIWorkflow(projectId, userInput);
 *       console.log('AI response:', result);
 *       setUserInput('');
 *     } catch (error) {
 *       console.error(error);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         value={userInput}
 *         onChange={(e) => setUserInput(e.target.value)}
 *         placeholder="Tell AI what to create..."
 *       />
 *       <button onClick={handleSend} disabled={loading}>
 *         {loading ? 'Generating...' : 'Send'}
 *       </button>
 *     </div>
 *   );
 * }
 */
