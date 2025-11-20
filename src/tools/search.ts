import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BinelekGatewayClient } from '../gateway/client.js';

export function registerSearchTools(
  server: Server,
  gateway: BinelekGatewayClient,
  allTools: any[]
) {
  const tools = [
    {
      name: 'binelek_semantic_search',
      description: 'Perform semantic search across the knowledge graph using vector embeddings. This finds entities based on meaning rather than exact keyword matches. Great for natural language queries.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query in natural language (e.g., "luxury waterfront properties with modern amenities")'
          },
          entityTypes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional: Limit search to specific entity types (e.g., ["Property", "Owner"])'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10)',
            default: 10
          }
        },
        required: ['query']
      }
    },
    {
      name: 'binelek_keyword_search',
      description: 'Perform keyword-based search using Elasticsearch. This provides exact matches and supports filters for structured queries.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The keyword search query'
          },
          filters: {
            type: 'object',
            description: 'Optional filters (e.g., {"propertyType": "residential", "minPrice": 500000})',
            additionalProperties: true
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10)',
            default: 10
          }
        },
        required: ['query']
      }
    },
    {
      name: 'binelek_hybrid_search',
      description: 'Combine semantic and keyword search for best results. This uses both vector similarity and keyword matching with configurable weights.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query'
          },
          semanticWeight: {
            type: 'number',
            description: 'Weight for semantic search (0-1, default: 0.5)',
            default: 0.5
          },
          keywordWeight: {
            type: 'number',
            description: 'Weight for keyword search (0-1, default: 0.5)',
            default: 0.5
          },
          entityTypes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional: Limit to specific entity types'
          },
          filters: {
            type: 'object',
            description: 'Optional filters for keyword component',
            additionalProperties: true
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 10)',
            default: 10
          }
        },
        required: ['query']
      }
    }
  ];

  allTools.push(...tools);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'binelek_semantic_search': {
          const { query, entityTypes, limit } = args as {
            query: string;
            entityTypes?: string[];
            limit?: number;
          };
          const result = await gateway.semanticSearch(query, entityTypes, limit);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_keyword_search': {
          const { query, filters, limit } = args as {
            query: string;
            filters?: Record<string, any>;
            limit?: number;
          };
          const result = await gateway.keywordSearch(query, filters, limit);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_hybrid_search': {
          const result = await gateway.hybridSearch(args.query, args);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        default:
          return {
            content: [{
              type: 'text',
              text: `Unknown tool: ${name}`
            }],
            isError: true
          };
      }
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  });
}
