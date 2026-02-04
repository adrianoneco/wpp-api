const sessionRoutes = require('./sessionRoutes');
const messageRoutes = require('./messageRoutes');
const mediaRoutes = require('./mediaRoutes');

async function registerRoutes(fastify) {
  // Health check
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Verificar saúde da API',
      description: 'Retorna o status da API e timestamp atual',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API info
  fastify.get('/', {
    schema: {
      tags: ['Health'],
      summary: 'Informações da API',
      description: 'Retorna informações gerais sobre a API e endpoints disponíveis',
      response: {
        200: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            description: { type: 'string' },
            endpoints: { type: 'object' },
          },
        },
      },
    },
  }, async () => {
    return {
      name: 'WPP API',
      version: '1.0.0',
      description: 'WhatsApp API with WPPConnect, Fastify, MongoDB and MinIO S3',
      endpoints: {
        sessions: '/api/sessions',
        messages: '/api/sessions/:sessionName/messages',
        media: '/api/media',
        health: '/health',
        docs: '/docs',
      },
    };
  });

  // Register API routes
  fastify.register(sessionRoutes, { prefix: '/api' });
  fastify.register(messageRoutes, { prefix: '/api' });
  fastify.register(mediaRoutes, { prefix: '/api' });
}

module.exports = registerRoutes;
