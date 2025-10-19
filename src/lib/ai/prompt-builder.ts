/**
 * AI Prompt Builder
 * Formats project context into prompts for Gemini/Claude
 */

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface ProjectContext {
  project: {
    id: string;
    title: string;
    description: string | null;
    canvas_data: any;
    created_at: string;
    updated_at: string;
  };
  messages: AIMessage[];
  latest_version: any;
  stats: {
    total_messages: number;
    total_versions: number;
    elements_count: number;
    returned_messages: number;
  };
}

/**
 * Builds a comprehensive prompt with full context for the AI
 */
export function buildAIPrompt(
  context: ProjectContext,
  newUserMessage: string
): string {
  const { project, messages, stats } = context;

  // Format conversation history
  const conversationHistory =
    messages.length > 0
      ? messages
          .map((msg) => {
            const role = msg.role === "assistant" ? "AI" : "User";
            return `${role}: ${msg.content}`;
          })
          .join("\n")
      : "No previous conversation";

  // Analyze current canvas
  const elements = project.canvas_data?.elements || [];
  const elementSummary = elements.length > 0
    ? `Current diagram has ${elements.length} elements:\n${analyzeElements(elements)}`
    : "Canvas is empty - no elements yet";

  // Build the comprehensive prompt
  const prompt = `
You are an AI assistant helping to create and modify workflow diagrams in Excalidraw format.

PROJECT INFORMATION:
- Title: ${project.title}
- Description: ${project.description || "No description"}
- Total edits: ${stats.total_versions}
- Total conversations: ${stats.total_messages}

CURRENT CANVAS STATE:
${elementSummary}

CONVERSATION HISTORY (last ${stats.returned_messages} messages):
${conversationHistory}

USER'S NEW REQUEST:
${newUserMessage}

INSTRUCTIONS:
- Consider the full conversation history above
- Be aware of the current canvas state
- Respond with what changes you'll make to the diagram
- Generate Excalidraw elements (rectangles, arrows, text, etc.) as needed
- Maintain consistency with previous decisions in the conversation
- Reference specific elements by their properties if modifying existing ones

Please respond with your plan and the Excalidraw elements to add/modify.
`.trim();

  return prompt;
}

/**
 * Builds a system prompt for initializing the AI assistant
 */
export function buildSystemPrompt(): string {
  return `You are an expert at creating workflow diagrams, architecture diagrams, and flowcharts using Excalidraw.

Your capabilities:
- Generate Excalidraw JSON elements (rectangles, ellipses, diamonds, arrows, text)
- Create microservices architectures, database schemas, flowcharts, and more
- Understand and maintain context across multiple conversations
- Modify existing diagrams based on user feedback
- Follow best practices for diagram layout and design

When responding:
1. Acknowledge what the user asked for
2. Explain what you're adding/changing
3. Provide the Excalidraw element JSON
4. Describe the layout/positioning strategy

Output format for elements:
{
  "elements": [
    {
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "strokeColor": "#000000",
      "backgroundColor": "#ffffff",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "roughness": 1,
      "opacity": 100,
      "roundness": { "type": 3 },
      "text": "Service Name",
      "fontSize": 20,
      "fontFamily": 1,
      "textAlign": "center",
      "verticalAlign": "middle"
    }
  ]
}`;
}

/**
 * Analyzes canvas elements and returns a summary
 */
function analyzeElements(elements: any[]): string {
  const typeCounts: Record<string, number> = {};

  elements.forEach((el) => {
    const type = el.type || "unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const summary = Object.entries(typeCounts)
    .map(([type, count]) => `  - ${count} ${type}${count > 1 ? "s" : ""}`)
    .join("\n");

  return summary || "  - No elements";
}

/**
 * Formats conversation messages for the AI (Claude/Gemini API format)
 */
export function formatMessagesForAPI(
  context: ProjectContext,
  newUserMessage: string
): Array<{ role: string; content: string }> {
  const formattedMessages: Array<{ role: string; content: string }> = [];

  // Add system message with canvas context
  const elements = context.project.canvas_data?.elements || [];
  const canvasInfo = `Current canvas state: ${elements.length} elements. ${analyzeElements(elements)}`;

  formattedMessages.push({
    role: "system",
    content: `${buildSystemPrompt()}\n\n${canvasInfo}`,
  });

  // Add conversation history
  context.messages.forEach((msg) => {
    formattedMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    });
  });

  // Add new user message
  formattedMessages.push({
    role: "user",
    content: newUserMessage,
  });

  return formattedMessages;
}

/**
 * Extracts Excalidraw elements from AI response
 * Handles various response formats
 */
export function extractElementsFromAIResponse(
  aiResponse: string
): any[] | null {
  try {
    // Try to find JSON in the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*"elements"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.elements || null;
    }

    // Try to find just an elements array
    const arrayMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to extract elements from AI response:", error);
    return null;
  }
}
