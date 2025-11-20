# Binelek MCP Server

Model Context Protocol (MCP) server for the Binelek Platform. This server provides MCP tools for interacting with the Binelek knowledge graph, search, AI, and data pipeline services through the API Gateway.

## Features

- **Knowledge Graph Tools**: Query, create, update, and delete entities and relationships
- **Search Tools**: Semantic, keyword, and hybrid search capabilities
- **AI Tools**: Chat with AI, make predictions, analyze entities
- **Pipeline Tools**: Trigger and monitor data pipelines
- **Admin Tools**: Domain configuration, YAML validation, code generation

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```env
BINELEK_GATEWAY_URL=http://localhost:8092
BINELEK_TENANT_ID=core
BINELEK_JWT_TOKEN=your-jwt-token-here
LOG_LEVEL=info
```

## Usage

### As a Standalone Server

```bash
npm start
```

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "binelek": {
      "command": "node",
      "args": ["/path/to/binelek-mcp-server/build/index.js"],
      "env": {
        "BINELEK_GATEWAY_URL": "http://localhost:8092",
        "BINELEK_TENANT_ID": "core",
        "BINELEK_JWT_TOKEN": "your-jwt-token"
      }
    }
  }
}
```

### With VS Code Extension

The `binelek-vscode-extension` uses this MCP server. See that project's README for setup instructions.

## Available Tools

### Ontology Tools

- `binelek_get_entity` - Get entity by ID
- `binelek_query_entities` - Execute Cypher queries
- `binelek_create_entity` - Create new entities
- `binelek_update_entity` - Update existing entities
- `binelek_delete_entity` - Delete entities
- `binelek_get_relationships` - Get entity relationships
- `binelek_create_relationship` - Create relationships

### Search Tools

- `binelek_semantic_search` - Semantic search using embeddings
- `binelek_keyword_search` - Keyword search with Elasticsearch
- `binelek_hybrid_search` - Combined semantic + keyword search

### AI Tools

- `binelek_ai_chat` - Chat with Binelek AI assistant
- `binelek_ai_predict` - Make predictions with ML models
- `binelek_ai_analyze_entity` - AI-powered entity analysis

### Pipeline Tools

- `binelek_list_pipelines` - List all pipelines
- `binelek_get_pipeline` - Get pipeline details
- `binelek_trigger_pipeline` - Trigger pipeline execution
- `binelek_get_pipeline_runs` - Get pipeline run history

### Admin Tools

- `binelek_list_domains` - List available domains
- `binelek_get_domain` - Get domain configuration
- `binelek_get_ontology_schema` - Get ontology YAML schema
- `binelek_validate_yaml` - Validate ontology YAML
- `binelek_generate_code` - Generate code from YAML

## Authentication

The MCP server uses JWT tokens to authenticate with the Binelek API Gateway. You can:

1. **Set in environment**: `BINELEK_JWT_TOKEN=your-token`
2. **Set in .env file**: See `.env.example`
3. **Pass via MCP config**: When configuring in Claude Desktop or VS Code

To obtain a JWT token, authenticate through the Binelek platform or use the auth API:

```bash
curl -X POST http://localhost:8092/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

## Architecture

```
MCP Client (Claude/VS Code)
  ↓ stdio
MCP Server (this project)
  ↓ HTTP/REST
API Gateway (localhost:8092)
  ↓ routes to
Backend Services (Ontology, Search, AI, Pipeline, etc.)
```

**Important**: The MCP server communicates ONLY with the API Gateway, never directly with backend services. This ensures proper authentication, tenant isolation, and rate limiting.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (auto-reload)
npm run dev

# Type check
npm run type-check
```

## Error Handling

The server handles errors gracefully and returns them in MCP format:

```json
{
  "content": [{
    "type": "text",
    "text": "Error: Entity not found: prop_123"
  }],
  "isError": true
}
```

## License

MIT
