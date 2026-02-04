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
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');

const config = require('./config');
const { connectDatabase } = require('./config/database');
const { minioService, wppConnectService } = require('./services');
const registerRoutes = require('./routes');

// Register Swagger documentation
fastify.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'WPPConnect API Rest',
      description: 'Welcome to the wppconnect-server API documentation. This API provides a set of endpoints to interact with the wppconnect-server application, allowing you to build integrations and automate interactions with WhatsApp.',
      version: '2.0.0',
      contact: {
        name: 'Suporte',
      },
    },
    servers: [
      {
        url: config.server.publicUrl,
        description: `Servidor ${config.instance.name}`,
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication and session management' },
      { name: 'Chat', description: 'Manages chat-related operations' },
      { name: 'Contact', description: 'Handles operations related to contacts, such as managing contact lists, adding or removing contacts, and retrieving contact information' },
      { name: 'Catalog & Business', description: 'Handles operations related to catalogs and business-related functionalities, such as managing product catalogs and business information' },
      { name: 'Community', description: 'Manage communities' },
      { name: 'Messages', description: 'Handles message-related operations, including sending, receiving, and managing messages' },
      { name: 'Profile', description: 'Manages user profile-related operations, such as retrieving and updating profile information' },
      { name: 'Status Stories', description: 'Handles operations related to status stories, such as viewing, updating, and managing status stories' },
      { name: 'Labels', description: 'Manages labels or tags associated with chats or messages for organization and categorization purposes' },
      { name: 'Group', description: 'Manages operations related to WhatsApp groups, such as creating, modifying, and managing group settings' },
      { name: 'Misc', description: 'Handles miscellaneous operations that do not fit into other specific categories' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: false,
  transformStaticCSP: (header) => header,
});

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
    console.log(`📂 Instance: ${config.instance.name}`);
    console.log(`📂 Data path: ${config.instance.dataPath}`);

    // Ensure data directories exist
    wppConnectService.ensureDirectories();

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
    console.log(`📖 API Documentation: ${config.server.publicUrl}/docs`);

    // Auto-initialize instance session if INSTANCE_NAME is set
    if (config.instance.name && config.instance.name !== 'default') {
      console.log(`📱 Initializing instance: ${config.instance.name}`);
      try {
        await wppConnectService.initializeInstanceSession(config.instance.name);
        console.log(`✅ Instance '${config.instance.name}' initialized successfully`);
        console.log(`   Check status at: ${config.server.publicUrl}/api/sessions/${config.instance.name}/status`);
        console.log(`   Get QR Code at: ${config.server.publicUrl}/api/sessions/${config.instance.name}/qrcode`);
      } catch (err) {
        console.error(`⚠️ Failed to initialize instance '${config.instance.name}':`, err.message);
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
