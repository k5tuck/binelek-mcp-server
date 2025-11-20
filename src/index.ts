#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { BinelekGatewayClient } from './gateway/client.js';
import { registerOntologyTools } from './tools/ontology.js';
import { registerSearchTools } from './tools/search.js';
import { registerAITools } from './tools/ai.js';
import { registerPipelineTools } from './tools/pipeline.js';
import { registerAdminTools } from './tools/admin.js';

// Load environment variables
dotenv.config();

const GATEWAY_URL = process.env.BINELEK_GATEWAY_URL || 'http://localhost:8092';
const JWT_TOKEN = process.env.BINELEK_JWT_TOKEN;
const TENANT_ID = process.env.BINELEK_TENANT_ID || 'core';

async function main() {
  console.error('Starting Binelek MCP Server...');
  console.error(`Gateway URL: ${GATEWAY_URL}`);
  console.error(`Tenant ID: ${TENANT_ID}`);
  console.error(`Authentication: ${JWT_TOKEN ? 'Token provided' : 'No token (will use public endpoints only)'}`);

  // Initialize API Gateway client
  const gateway = new BinelekGatewayClient({
    baseUrl: GATEWAY_URL,
    token: JWT_TOKEN,
    tenantId: TENANT_ID
  });

  // Test connection
  try {
    await gateway.healthCheck();
    console.error('✓ Successfully connected to Binelek API Gateway');
  } catch (error: any) {
    console.error(`✗ Failed to connect to API Gateway: ${error.message}`);
    console.error('Server will start but tools may not work correctly');
  }

  // Create MCP server
  const server = new Server(
    {
      name: 'binelek-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Store all tools
  const allTools: any[] = [];

  // Register tool handlers
  registerOntologyTools(server, gateway, allTools);
  registerSearchTools(server, gateway, allTools);
  registerAITools(server, gateway, allTools);
  registerPipelineTools(server, gateway, allTools);
  registerAdminTools(server, gateway, allTools);

  // Handle tools/list request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools
    };
  });

  console.error(`Registered ${allTools.length} tools`);

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✓ Binelek MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
