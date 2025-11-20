import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BinelekGatewayClient } from '../gateway/client.js';

export function registerPipelineTools(
  server: Server,
  gateway: BinelekGatewayClient,
  allTools: any[]
) {
  const tools = [
    {
      name: 'binelek_list_pipelines',
      description: 'List all available data pipelines in the Binelek platform. Pipelines handle ETL operations, data ingestion from various sources, and automated data processing.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    },
    {
      name: 'binelek_get_pipeline',
      description: 'Get details about a specific pipeline including its configuration, schedule, and status.',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: {
            type: 'string',
            description: 'The ID of the pipeline to retrieve'
          }
        },
        required: ['pipelineId']
      }
    },
    {
      name: 'binelek_trigger_pipeline',
      description: 'Manually trigger a pipeline execution. This will start an immediate run of the pipeline with optional parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: {
            type: 'string',
            description: 'The ID of the pipeline to trigger'
          },
          parameters: {
            type: 'object',
            description: 'Optional parameters to pass to the pipeline',
            additionalProperties: true
          }
        },
        required: ['pipelineId']
      }
    },
    {
      name: 'binelek_get_pipeline_runs',
      description: 'Get the execution history for a specific pipeline. Shows all runs with their status, duration, and results.',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: {
            type: 'string',
            description: 'The ID of the pipeline whose runs to retrieve'
          }
        },
        required: ['pipelineId']
      }
    }
  ];

  allTools.push(...tools);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'binelek_list_pipelines': {
          const result = await gateway.listPipelines();
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_get_pipeline': {
          const { pipelineId } = args as { pipelineId: string };
          const result = await gateway.getPipeline(pipelineId);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_trigger_pipeline': {
          const { pipelineId, parameters } = args as {
            pipelineId: string;
            parameters?: Record<string, any>;
          };
          const result = await gateway.triggerPipeline(pipelineId, parameters);
          return {
            content: [{
              type: 'text',
              text: `Pipeline triggered successfully:\n${JSON.stringify(result, null, 2)}`
            }]
          };
        }

        case 'binelek_get_pipeline_runs': {
          const { pipelineId } = args as { pipelineId: string };
          const result = await gateway.getPipelineRuns(pipelineId);
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
