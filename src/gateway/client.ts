import axios, { AxiosInstance, AxiosError } from 'axios';

export interface GatewayConfig {
  baseUrl: string;
  token?: string;
  tenantId: string;
  timeout?: number;
}

export class BinelekGatewayClient {
  private client: AxiosInstance;
  private tenantId: string;

  constructor(config: GatewayConfig) {
    this.tenantId = config.tenantId;

    const headers: Record<string, string> = {
      'X-Tenant-Id': config.tenantId,
      'Content-Type': 'application/json'
    };

    if (config.token) {
      headers['Authorization'] = `Bearer ${config.token}`;
    }

    this.client = axios.create({
      baseURL: config.baseUrl,
      headers,
      timeout: config.timeout || 30000,
      validateStatus: (status) => status < 500 // Don't throw on 4xx
    });

    // Add error logging interceptor
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response) {
          console.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          console.error('API Error: No response received');
        } else {
          console.error(`API Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new Error(`API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('No response from API Gateway. Is it running?');
    } else {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============= Ontology Service =============

  async getEntity(entityId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/ontology/entities/${entityId}`);
      if (response.status === 404) {
        throw new Error(`Entity not found: ${entityId}`);
      }
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async queryEntities(cypherQuery: string, parameters?: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post('/api/ontology/query', {
        query: cypherQuery,
        parameters: parameters || {}
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createEntity(entityType: string, attributes: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post('/api/ontology/entities', {
        type: entityType,
        attributes,
        tenantId: this.tenantId
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateEntity(entityId: string, attributes: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.put(`/api/ontology/entities/${entityId}`, {
        attributes
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteEntity(entityId: string): Promise<any> {
    try {
      const response = await this.client.delete(`/api/ontology/entities/${entityId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRelationships(entityId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/ontology/entities/${entityId}/relationships`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createRelationship(sourceId: string, targetId: string, relationshipType: string, properties?: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post('/api/ontology/relationships', {
        sourceId,
        targetId,
        type: relationshipType,
        properties: properties || {}
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============= Search Service =============

  async semanticSearch(query: string, entityTypes?: string[], limit = 10): Promise<any> {
    try {
      const response = await this.client.post('/api/search/semantic', {
        query,
        entityTypes,
        limit
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async keywordSearch(query: string, filters?: Record<string, any>, limit = 10): Promise<any> {
    try {
      const response = await this.client.post('/api/search/keyword', {
        query,
        filters,
        limit
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async hybridSearch(query: string, options?: any): Promise<any> {
    try {
      const response = await this.client.post('/api/search/hybrid', {
        query,
        ...options
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============= AI Platform =============

  async predict(modelType: string, input: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post('/api/ai/predict', {
        modelType,
        input
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async chat(message: string, context?: any[]): Promise<any> {
    try {
      const response = await this.client.post('/api/ai/chat', {
        message,
        context: context || []
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async analyzeEntity(entityId: string, analysisType: string): Promise<any> {
    try {
      const response = await this.client.post('/api/ai/analyze', {
        entityId,
        analysisType
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============= Pipeline Service =============

  async listPipelines(): Promise<any> {
    try {
      const response = await this.client.get('/api/pipeline/pipelines');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPipeline(pipelineId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/pipeline/pipelines/${pipelineId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async triggerPipeline(pipelineId: string, parameters?: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post(`/api/pipeline/pipelines/${pipelineId}/trigger`, parameters || {});
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPipelineRuns(pipelineId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/pipeline/pipelines/${pipelineId}/runs`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============= Domain Configuration =============

  async listDomains(): Promise<any> {
    try {
      const response = await this.client.get('/api/domains');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainConfig(domainName: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/domains/${domainName}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOntologySchema(domainName: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/domains/${domainName}/ontology`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============= Code Generation =============

  async validateYaml(yamlContent: string): Promise<any> {
    try {
      const response = await this.client.post('/api/regen/validate', {
        yaml: yamlContent
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateCode(yamlContent: string, targetLanguage: string): Promise<any> {
    try {
      const response = await this.client.post('/api/regen/generate', {
        yaml: yamlContent,
        language: targetLanguage
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
