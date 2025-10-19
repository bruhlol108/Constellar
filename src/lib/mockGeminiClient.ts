/**
 * Mock Gemini API Client
 *
 * Simulates Gemini API responses for testing without requiring an API key.
 * Returns realistic diagram generation responses with actions.
 */

export interface MockGeminiResponse {
  text: string;
  actions?: any[];
  hasActions: boolean;
}

// Sample responses for different types of prompts
const MOCK_RESPONSES: Record<string, MockGeminiResponse> = {
  "flowchart": {
    text: `I'll create a simple flowchart with three connected steps for you.

\`\`\`json
{
  "actions": [
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "Start",
      "x": 100,
      "y": 150,
      "width": 150,
      "height": 80
    },
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "Process",
      "x": 350,
      "y": 150,
      "width": 150,
      "height": 80
    },
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "End",
      "x": 600,
      "y": 150,
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

I've created a basic flowchart with Start → Process → End nodes connected by arrows.`,
    hasActions: true,
    actions: [
      {
        type: "create_shape",
        shape: "rectangle",
        text: "Start",
        x: 100,
        y: 150,
        width: 150,
        height: 80
      },
      {
        type: "create_shape",
        shape: "rectangle",
        text: "Process",
        x: 350,
        y: 150,
        width: 150,
        height: 80
      },
      {
        type: "create_shape",
        shape: "rectangle",
        text: "End",
        x: 600,
        y: 150,
        width: 150,
        height: 80
      },
      {
        type: "connect",
        from: 0,
        to: 1
      },
      {
        type: "connect",
        from: 1,
        to: 2
      }
    ]
  },
  "neural": {
    text: `I'll create a neural network diagram with an input layer, hidden layer, and output layer.

\`\`\`json
{
  "actions": [
    {
      "type": "create_shape",
      "shape": "ellipse",
      "text": "Input Layer",
      "x": 100,
      "y": 200,
      "width": 120,
      "height": 120
    },
    {
      "type": "create_shape",
      "shape": "ellipse",
      "text": "Hidden Layer",
      "x": 350,
      "y": 200,
      "width": 120,
      "height": 120
    },
    {
      "type": "create_shape",
      "shape": "ellipse",
      "text": "Output Layer",
      "x": 600,
      "y": 200,
      "width": 120,
      "height": 120
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

Created a 3-layer neural network with circular nodes connected by arrows.`,
    hasActions: true,
    actions: [
      {
        type: "create_shape",
        shape: "ellipse",
        text: "Input Layer",
        x: 100,
        y: 200,
        width: 120,
        height: 120
      },
      {
        type: "create_shape",
        shape: "ellipse",
        text: "Hidden Layer",
        x: 350,
        y: 200,
        width: 120,
        height: 120
      },
      {
        type: "create_shape",
        shape: "ellipse",
        text: "Output Layer",
        x: 600,
        y: 200,
        width: 120,
        height: 120
      },
      {
        type: "connect",
        from: 0,
        to: 1
      },
      {
        type: "connect",
        from: 1,
        to: 2
      }
    ]
  },
  "default": {
    text: `I'll create a simple diagram with a few connected shapes for you.

\`\`\`json
{
  "actions": [
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "Component A",
      "x": 150,
      "y": 200,
      "width": 180,
      "height": 100
    },
    {
      "type": "create_shape",
      "shape": "rectangle",
      "text": "Component B",
      "x": 450,
      "y": 200,
      "width": 180,
      "height": 100
    },
    {
      "type": "connect",
      "from": 0,
      "to": 1
    }
  ]
}
\`\`\`

I've created two connected components for your diagram.`,
    hasActions: true,
    actions: [
      {
        type: "create_shape",
        shape: "rectangle",
        text: "Component A",
        x: 150,
        y: 200,
        width: 180,
        height: 100
      },
      {
        type: "create_shape",
        shape: "rectangle",
        text: "Component B",
        x: 450,
        y: 200,
        width: 180,
        height: 100
      },
      {
        type: "connect",
        from: 0,
        to: 1
      }
    ]
  }
};

/**
 * Simulates a Gemini API call with realistic delay
 */
export async function mockSendMessage(prompt: string): Promise<MockGeminiResponse> {
  // Simulate network delay (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));

  // Determine which response to use based on keywords
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("flowchart") || lowerPrompt.includes("flow chart")) {
    return MOCK_RESPONSES["flowchart"];
  } else if (lowerPrompt.includes("neural") || lowerPrompt.includes("network")) {
    return MOCK_RESPONSES["neural"];
  } else {
    return MOCK_RESPONSES["default"];
  }
}
