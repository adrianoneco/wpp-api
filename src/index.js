const fastify = require('fastify')({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');

const config = require('./config');
const { connectDatabase } = require('./config/database');
const { minioService, wppConnectService } = require('./services');
const registerRoutes = require('./routes');

// Register plugins
fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Register routes
fastify.register(registerRoutes);

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    success: false,
    error: error.message || 'Internal Server Error',
  });
});

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize MinIO
    await minioService.initialize();

    // Start Fastify server
    await fastify.listen({
      host: config.server.host,
      port: config.server.port,
    });

    console.log(`🚀 Server running at http://${config.server.host}:${config.server.port}`);

    // Auto-create instance if INSTANCE_NAME is set
    if (config.instance.name) {
      console.log(`📱 Starting fixed instance: ${config.instance.name}`);
      try {
        await wppConnectService.createSession(config.instance.name);
        console.log(`✅ Instance '${config.instance.name}' started successfully`);
      } catch (err) {
        console.error(`⚠️ Failed to start instance '${config.instance.name}':`, err.message);
        console.log('You can still create the session manually via API');
      }
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    // Close all WPPConnect sessions
    const sessions = wppConnectService.getAllSessions();
    for (const sessionName of sessions) {
      await wppConnectService.closeSession(sessionName);
    }
    await fastify.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
