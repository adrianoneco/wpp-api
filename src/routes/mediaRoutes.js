const { minioService } = require('../services');

// Schema definitions
const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: { type: 'string' },
  },
};

const fileResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    file: {
      type: 'object',
      properties: {
        objectName: { type: 'string' },
        url: { type: 'string' },
        mimetype: { type: 'string' },
        size: { type: 'integer' },
      },
    },
  },
};

async function mediaRoutes(fastify) {
  // Upload file
  fastify.post('/media/upload', {
    schema: {
      tags: ['Media'],
      summary: 'Upload de arquivo',
      description: 'Faz upload de um arquivo via multipart/form-data para o armazenamento MinIO',
      consumes: ['multipart/form-data'],
      response: {
        200: fileResponse,
        400: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.code(400);
        return { success: false, error: 'No file provided' };
      }

      const buffer = await data.toBuffer();
      const result = await minioService.uploadFile(buffer, data.mimetype, data.filename);
      
      return { success: true, file: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Upload base64 file
  fastify.post('/media/upload/base64', {
    schema: {
      tags: ['Media'],
      summary: 'Upload de arquivo em base64',
      description: 'Faz upload de um arquivo em formato base64 para o armazenamento MinIO',
      body: {
        type: 'object',
        required: ['data', 'mimetype'],
        properties: {
          data: {
            type: 'string',
            description: 'Conteúdo do arquivo em base64',
          },
          mimetype: {
            type: 'string',
            description: 'Tipo MIME do arquivo',
          },
          filename: {
            type: 'string',
            description: 'Nome do arquivo (opcional, será gerado se não informado)',
          },
        },
      },
      response: {
        200: fileResponse,
        400: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const { data, mimetype, filename } = request.body;

      if (!data || !mimetype) {
        reply.code(400);
        return { success: false, error: 'data (base64) and mimetype are required' };
      }

      const result = await minioService.uploadBase64(data, mimetype, filename);
      return { success: true, file: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get file URL
  fastify.get('/media/:objectName', {
    schema: {
      tags: ['Media'],
      summary: 'Obter URL do arquivo',
      description: 'Retorna uma URL temporária (presigned) para download do arquivo',
      params: {
        type: 'object',
        properties: {
          objectName: {
            type: 'string',
            description: 'Nome do objeto no MinIO',
          },
        },
        required: ['objectName'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            url: {
              type: 'string',
              description: 'URL temporária para download',
            },
          },
        },
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const { objectName } = request.params;
      const url = await minioService.getFileUrl(decodeURIComponent(objectName));
      return { success: true, url };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Delete file
  fastify.delete('/media/:objectName', {
    schema: {
      tags: ['Media'],
      summary: 'Excluir arquivo',
      description: 'Remove um arquivo do armazenamento MinIO',
      params: {
        type: 'object',
        properties: {
          objectName: {
            type: 'string',
            description: 'Nome do objeto no MinIO',
          },
        },
        required: ['objectName'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const { objectName } = request.params;
      await minioService.deleteFile(decodeURIComponent(objectName));
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // List files
  fastify.get('/media', {
    schema: {
      tags: ['Media'],
      summary: 'Listar arquivos',
      description: 'Lista todos os arquivos armazenados no MinIO, opcionalmente filtrados por prefixo',
      querystring: {
        type: 'object',
        properties: {
          prefix: {
            type: 'string',
            description: 'Prefixo para filtrar arquivos (pasta virtual)',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  size: { type: 'integer' },
                  lastModified: { type: 'string' },
                },
              },
            },
          },
        },
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const { prefix } = request.query;
      const files = await minioService.listFiles(prefix);
      return { success: true, files };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

module.exports = mediaRoutes;
