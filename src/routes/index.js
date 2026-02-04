const sessionRoutes = require('./sessionRoutes');
const messageRoutes = require('./messageRoutes');
const mediaRoutes = require('./mediaRoutes');
const authRoutes = require('./authRoutes');
const chatRoutes = require('./chatRoutes');
const contactRoutes = require('./contactRoutes');
const groupRoutes = require('./groupRoutes');
const miscRoutes = require('./miscRoutes');
const profileRoutes = require('./profileRoutes');

async function registerRoutes(fastify) {
  // Health check
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check endpoint',
      description: 'Returns the API status and current timestamp',
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
      summary: 'API Information',
      description: 'Returns general information about the API and available endpoints',
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
      name: 'WPPConnect API Rest',
      version: '2.0.0',
      description: 'WhatsApp API with WPPConnect, Fastify, MongoDB and MinIO S3',
      endpoints: {
        auth: '/api/:session/generate-token',
        sessions: '/api/sessions',
        messages: '/api/:session/send-message',
        chat: '/api/:session/all-chats',
        contacts: '/api/:session/all-contacts',
        groups: '/api/:session/all-groups',
        profile: '/api/:session/profile-status',
        misc: '/api/:session/check-number-status',
        media: '/api/media',
        health: '/health',
        docs: '/docs',
      },
    };
  });

  // Register API routes
  fastify.register(authRoutes, { prefix: '/api' });
  fastify.register(sessionRoutes, { prefix: '/api' });
  fastify.register(messageRoutes, { prefix: '/api' });
  fastify.register(chatRoutes, { prefix: '/api' });
  fastify.register(contactRoutes, { prefix: '/api' });
  fastify.register(groupRoutes, { prefix: '/api' });
  fastify.register(profileRoutes, { prefix: '/api' });
  fastify.register(miscRoutes, { prefix: '/api' });
  fastify.register(mediaRoutes, { prefix: '/api' });
}

module.exports = registerRoutes;
