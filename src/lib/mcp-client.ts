/**
 * MCP Client for Constellar
 * Connects to the Python MCP server and calls tools
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://127.0.0.1:8000";

let client: Client | null = null;

async function getClient(): Promise<Client> {
  if (client) {
    return client;
  }

  // Create SSE transport
  const transport = new SSEClientTransport(new URL(`${MCP_SERVER_URL}/sse`));

  // Create client
  client = new Client(
    {
      name: "constellar-web",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  // Connect to server
  await client.connect(transport);

  return client;
}

export async function callMCPTool(
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  try {
    console.log(`[MCP Client] Getting client...`);
    const mcpClient = await getClient();
    console.log(`[MCP Client] Client obtained, calling tool: ${toolName}`);

    // Call the tool
    const result = await mcpClient.callTool({
      name: toolName,
      arguments: args,
    });

    console.log(`[MCP Client] Tool ${toolName} result:`, JSON.stringify(result, null, 2));

    // Parse the result
    if (result.content && result.content.length > 0) {
      const content = result.content[0];
      if (content.type === "text") {
        const parsed = JSON.parse(content.text);
        console.log(`[MCP Client] Parsed result:`, parsed);
        return parsed;
      }
    }

    console.log(`[MCP Client] No valid content in result`);
    return null;
  } catch (error) {
    console.error(`[MCP Client] Error calling MCP tool ${toolName}:`, error);
    throw error;
  }
}

export async function listMCPTools(): Promise<any[]> {
  try {
    const mcpClient = await getClient();
    const result = await mcpClient.listTools();
    return result.tools;
  } catch (error) {
    console.error("Error listing MCP tools:", error);
    return [];
  }
}

// Clean up on shutdown
export async function closeMCPClient() {
  if (client) {
    await client.close();
    client = null;
  }
}
