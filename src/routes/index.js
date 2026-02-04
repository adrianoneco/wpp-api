const sessionRoutes = require('./sessionRoutes');
const messageRoutes = require('./messageRoutes');
const mediaRoutes = require('./mediaRoutes');

async function registerRoutes(fastify) {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API info
  fastify.get('/', async () => {
    return {
      name: 'WPP API',
      version: '1.0.0',
      description: 'WhatsApp API with WPPConnect, Fastify, MongoDB and MinIO S3',
      endpoints: {
        sessions: '/api/sessions',
        messages: '/api/sessions/:sessionName/messages',
        media: '/api/media',
        health: '/health',
      },
    };
  });

  // Register API routes
  fastify.register(sessionRoutes, { prefix: '/api' });
  fastify.register(messageRoutes, { prefix: '/api' });
  fastify.register(mediaRoutes, { prefix: '/api' });
}

module.exports = registerRoutes;
