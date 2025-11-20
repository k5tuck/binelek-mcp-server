import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BinelekGatewayClient } from '../gateway/client.js';

export function registerAdminTools(
  server: Server,
  gateway: BinelekGatewayClient,
  allTools: any[]
) {
  const tools = [
    {
      name: 'binelek_list_domains',
      description: 'List all available domain configurations. Binelek supports multiple industry verticals (Real Estate, Healthcare, Finance, Smart Cities, Logistics).',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    },
    {
      name: 'binelek_get_domain',
      description: 'Get detailed configuration for a specific domain including metadata, pricing, and market analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          domainName: {
            type: 'string',
            description: 'The name of the domain (e.g., "real-estate", "healthcare")'
          }
        },
        required: ['domainName']
      }
    },
    {
      name: 'binelek_get_ontology_schema',
      description: 'Get the complete ontology schema for a domain. This includes all entity types, relationships, properties, and validation rules defined in the YAML configuration.',
      inputSchema: {
        type: 'object',
        properties: {
          domainName: {
            type: 'string',
            description: 'The name of the domain whose ontology to retrieve'
          }
        },
        required: ['domainName']
      }
    },
    {
      name: 'binelek_validate_yaml',
      description: 'Validate an ontology YAML configuration file against the Binelek schema. This checks syntax, structure, and business rules.',
      inputSchema: {
        type: 'object',
        properties: {
          yamlContent: {
            type: 'string',
            description: 'The YAML content to validate'
          }
        },
        required: ['yamlContent']
      }
    },
    {
      name: 'binelek_generate_code',
      description: 'Generate code from an ontology YAML file. The Binah.Regen service generates DTOs, validators, repositories, GraphQL schemas, and more.',
      inputSchema: {
        type: 'object',
        properties: {
          yamlContent: {
            type: 'string',
            description: 'The ontology YAML content'
          },
          targetLanguage: {
            type: 'string',
            description: 'Target language for code generation',
            enum: ['csharp', 'typescript', 'python', 'cypher']
          }
        },
        required: ['yamlContent', 'targetLanguage']
      }
    }
  ];

  allTools.push(...tools);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'binelek_list_domains': {
          const result = await gateway.listDomains();
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_get_domain': {
          const { domainName } = args as { domainName: string };
          const result = await gateway.getDomainConfig(domainName);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_get_ontology_schema': {
          const { domainName } = args as { domainName: string };
          const result = await gateway.getOntologySchema(domainName);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_validate_yaml': {
          const { yamlContent } = args as { yamlContent: string };
          const result = await gateway.validateYaml(yamlContent);
          return {
            content: [{
              type: 'text',
              text: result.valid
                ? `✓ YAML is valid\n${JSON.stringify(result, null, 2)}`
                : `✗ YAML validation failed:\n${JSON.stringify(result.errors, null, 2)}`
            }]
          };
        }

        case 'binelek_generate_code': {
          const { yamlContent, targetLanguage } = args as {
            yamlContent: string;
            targetLanguage: string;
          };
          const result = await gateway.generateCode(yamlContent, targetLanguage);
          return {
            content: [{
              type: 'text',
              text: `Code generated successfully:\n${JSON.stringify(result, null, 2)}`
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
