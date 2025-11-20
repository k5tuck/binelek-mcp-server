import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BinelekGatewayClient } from '../gateway/client.js';

export function registerAITools(
  server: Server,
  gateway: BinelekGatewayClient,
  allTools: any[]
) {
  const tools = [
    {
      name: 'binelek_ai_chat',
      description: 'Chat with the Binelek AI assistant. The AI has access to the knowledge graph and can answer questions, provide insights, and help with data analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Your message or question to the AI'
          },
          context: {
            type: 'array',
            description: 'Optional: Previous conversation context for multi-turn conversations',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                content: { type: 'string' }
              }
            }
          }
        },
        required: ['message']
      }
    },
    {
      name: 'binelek_ai_predict',
      description: 'Make predictions using trained ML models. Available models include: cost_forecasting, property_valuation, market_trends, risk_assessment.',
      inputSchema: {
        type: 'object',
        properties: {
          modelType: {
            type: 'string',
            description: 'The type of model to use (e.g., "cost_forecasting", "property_valuation")',
            enum: ['cost_forecasting', 'property_valuation', 'market_trends', 'risk_assessment']
          },
          input: {
            type: 'object',
            description: 'Input data for the prediction',
            additionalProperties: true
          }
        },
        required: ['modelType', 'input']
      }
    },
    {
      name: 'binelek_ai_analyze_entity',
      description: 'Analyze a specific entity using AI. Provides insights, anomaly detection, recommendations, and risk assessment.',
      inputSchema: {
        type: 'object',
        properties: {
          entityId: {
            type: 'string',
            description: 'The ID of the entity to analyze'
          },
          analysisType: {
            type: 'string',
            description: 'Type of analysis to perform',
            enum: ['insights', 'anomalies', 'recommendations', 'risk', 'comprehensive']
          }
        },
        required: ['entityId', 'analysisType']
      }
    }
  ];

  allTools.push(...tools);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'binelek_ai_chat': {
          const { message, context } = args as {
            message: string;
            context?: any[];
          };
          const result = await gateway.chat(message, context);
          return {
            content: [{
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_ai_predict': {
          const { modelType, input } = args as {
            modelType: string;
            input: Record<string, any>;
          };
          const result = await gateway.predict(modelType, input);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_ai_analyze_entity': {
          const { entityId, analysisType } = args as {
            entityId: string;
            analysisType: string;
          };
          const result = await gateway.analyzeEntity(entityId, analysisType);
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
