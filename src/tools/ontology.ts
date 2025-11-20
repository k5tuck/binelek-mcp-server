import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BinelekGatewayClient } from '../gateway/client.js';

export function registerOntologyTools(
  server: Server,
  gateway: BinelekGatewayClient,
  allTools: any[]
) {
  // Define tools
  const tools = [
    {
      name: 'binelek_get_entity',
      description: 'Get a specific entity from the Binelek knowledge graph by its ID. Returns all properties and metadata for the entity.',
      inputSchema: {
        type: 'object',
        properties: {
          entityId: {
            type: 'string',
            description: 'The unique identifier of the entity to retrieve'
          }
        },
        required: ['entityId']
      }
    },
    {
      name: 'binelek_query_entities',
      description: 'Execute a Cypher query against the Binelek Neo4j knowledge graph. Use this for complex graph traversals, pattern matching, and analytical queries. Returns query results as JSON.',
      inputSchema: {
        type: 'object',
        properties: {
          cypherQuery: {
            type: 'string',
            description: 'The Cypher query to execute (e.g., "MATCH (p:Property) WHERE p.price > $minPrice RETURN p LIMIT 10")'
          },
          parameters: {
            type: 'object',
            description: 'Optional parameters for the Cypher query (e.g., {"minPrice": 500000})',
            additionalProperties: true
          }
        },
        required: ['cypherQuery']
      }
    },
    {
      name: 'binelek_create_entity',
      description: 'Create a new entity in the Binelek knowledge graph. The entity will be validated against the ontology schema and relationships can be created to existing entities.',
      inputSchema: {
        type: 'object',
        properties: {
          entityType: {
            type: 'string',
            description: 'The type of entity to create (e.g., "Property", "Owner", "Transaction")'
          },
          attributes: {
            type: 'object',
            description: 'The attributes of the entity as key-value pairs',
            additionalProperties: true
          }
        },
        required: ['entityType', 'attributes']
      }
    },
    {
      name: 'binelek_update_entity',
      description: 'Update an existing entity in the knowledge graph. Only provided attributes will be updated, others remain unchanged.',
      inputSchema: {
        type: 'object',
        properties: {
          entityId: {
            type: 'string',
            description: 'The ID of the entity to update'
          },
          attributes: {
            type: 'object',
            description: 'The attributes to update',
            additionalProperties: true
          }
        },
        required: ['entityId', 'attributes']
      }
    },
    {
      name: 'binelek_delete_entity',
      description: 'Delete an entity from the knowledge graph. This will also remove all relationships connected to this entity.',
      inputSchema: {
        type: 'object',
        properties: {
          entityId: {
            type: 'string',
            description: 'The ID of the entity to delete'
          }
        },
        required: ['entityId']
      }
    },
    {
      name: 'binelek_get_relationships',
      description: 'Get all relationships connected to a specific entity. Returns both incoming and outgoing relationships with their types and properties.',
      inputSchema: {
        type: 'object',
        properties: {
          entityId: {
            type: 'string',
            description: 'The ID of the entity whose relationships to retrieve'
          }
        },
        required: ['entityId']
      }
    },
    {
      name: 'binelek_create_relationship',
      description: 'Create a relationship between two entities in the knowledge graph.',
      inputSchema: {
        type: 'object',
        properties: {
          sourceId: {
            type: 'string',
            description: 'The ID of the source entity'
          },
          targetId: {
            type: 'string',
            description: 'The ID of the target entity'
          },
          relationshipType: {
            type: 'string',
            description: 'The type of relationship (e.g., "OWNS", "LOCATED_IN", "MANAGES")'
          },
          properties: {
            type: 'object',
            description: 'Optional properties for the relationship',
            additionalProperties: true
          }
        },
        required: ['sourceId', 'targetId', 'relationshipType']
      }
    }
  ];

  allTools.push(...tools);

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'binelek_get_entity': {
          const { entityId } = args as { entityId: string };
          const result = await gateway.getEntity(entityId);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_query_entities': {
          const { cypherQuery, parameters } = args as {
            cypherQuery: string;
            parameters?: Record<string, any>;
          };
          const result = await gateway.queryEntities(cypherQuery, parameters);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_create_entity': {
          const { entityType, attributes } = args as {
            entityType: string;
            attributes: Record<string, any>;
          };
          const result = await gateway.createEntity(entityType, attributes);
          return {
            content: [{
              type: 'text',
              text: `Entity created successfully:\n${JSON.stringify(result, null, 2)}`
            }]
          };
        }

        case 'binelek_update_entity': {
          const { entityId, attributes } = args as {
            entityId: string;
            attributes: Record<string, any>;
          };
          const result = await gateway.updateEntity(entityId, attributes);
          return {
            content: [{
              type: 'text',
              text: `Entity updated successfully:\n${JSON.stringify(result, null, 2)}`
            }]
          };
        }

        case 'binelek_delete_entity': {
          const { entityId } = args as { entityId: string };
          await gateway.deleteEntity(entityId);
          return {
            content: [{
              type: 'text',
              text: `Entity ${entityId} deleted successfully`
            }]
          };
        }

        case 'binelek_get_relationships': {
          const { entityId } = args as { entityId: string };
          const result = await gateway.getRelationships(entityId);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
        }

        case 'binelek_create_relationship': {
          const { sourceId, targetId, relationshipType, properties } = args as {
            sourceId: string;
            targetId: string;
            relationshipType: string;
            properties?: Record<string, any>;
          };
          const result = await gateway.createRelationship(sourceId, targetId, relationshipType, properties);
          return {
            content: [{
              type: 'text',
              text: `Relationship created successfully:\n${JSON.stringify(result, null, 2)}`
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
