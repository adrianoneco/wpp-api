const { wppConnectService } = require('../services');
const config = require('../config');

async function miscRoutes(fastify) {
  const instanceName = config.instance.name;

  // Check Number Status
  fastify.get('/:session/check-number-status/:phone', {
    schema: {
      tags: ['Misc'],
      summary: 'Check number status',
      description: 'Checks if a phone number is registered on WhatsApp',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          phone: { type: 'string', example: '5521999999999' },
        },
        required: ['session', 'phone'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: {
              type: 'object',
              properties: {
                id: { type: 'object' },
                status: { type: 'number' },
                isBusiness: { type: 'boolean' },
                canReceiveMessage: { type: 'boolean' },
                numberExists: { type: 'boolean' },
              },
            },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, phone } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const contactId = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.checkNumberStatus(contactId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Blocklist
  fastify.get('/:session/blocklist', {
    schema: {
      tags: ['Misc'],
      summary: 'Get blocklist',
      description: 'Retrieves the list of blocked contacts',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'object' } },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const list = await client.getBlockList();
      return { status: 'success', response: list };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Block Contact
  fastify.post('/:session/block-contact', {
    schema: {
      tags: ['Misc'],
      summary: 'Block a contact',
      description: 'Blocks a contact from messaging you',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          phone: { type: 'string' },
        },
        required: ['phone'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { phone } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const contactId = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.blockContact(contactId);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Unblock Contact
  fastify.post('/:session/unblock-contact', {
    schema: {
      tags: ['Misc'],
      summary: 'Unblock a contact',
      description: 'Unblocks a previously blocked contact',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          phone: { type: 'string' },
        },
        required: ['phone'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { phone } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const contactId = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.unblockContact(contactId);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Battery Level
  fastify.get('/:session/get-battery-level', {
    schema: {
      tags: ['Misc'],
      summary: 'Get battery level',
      description: 'Gets the battery level of the connected phone',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'number' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const battery = await client.getBatteryLevel();
      return { status: 'success', response: battery };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Host Device
  fastify.get('/:session/host-device', {
    schema: {
      tags: ['Misc'],
      summary: 'Get host device info',
      description: 'Gets information about the connected phone',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const hostDevice = await client.getHostDevice();
      return { status: 'success', response: hostDevice };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Connection State
  fastify.get('/:session/get-connection-state', {
    schema: {
      tags: ['Misc'],
      summary: 'Get connection state',
      description: 'Gets the current connection state',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const state = await client.getConnectionState();
      return { status: 'success', response: state };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Is Connected
  fastify.get('/:session/is-connected', {
    schema: {
      tags: ['Misc'],
      summary: 'Check if connected',
      description: 'Checks if the WhatsApp session is connected',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        return { status: 'success', response: false };
      }
      const connected = await client.isConnected();
      return { status: 'success', response: connected };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Take Screenshot
  fastify.get('/:session/take-screenshot', {
    schema: {
      tags: ['Misc'],
      summary: 'Take screenshot',
      description: 'Takes a screenshot of the WhatsApp Web interface',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string', description: 'Base64 encoded screenshot' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const page = client.page;
      if (page) {
        const screenshot = await page.screenshot({ encoding: 'base64' });
        return { status: 'success', response: screenshot };
      }
      
      reply.code(400);
      return { status: 'error', message: 'Page not available' };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Kill Service Worker
  fastify.post('/:session/kill-service-worker', {
    schema: {
      tags: ['Misc'],
      summary: 'Kill service worker',
      description: 'Kills the WhatsApp service worker',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const result = await client.killServiceWorker();
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Restart Service
  fastify.post('/:session/restart-service', {
    schema: {
      tags: ['Misc'],
      summary: 'Restart service',
      description: 'Restarts the WhatsApp service',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const result = await client.restartService();
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Reject Call
  fastify.post('/:session/reject-call', {
    schema: {
      tags: ['Misc'],
      summary: 'Reject incoming call',
      description: 'Rejects an incoming WhatsApp call',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          callId: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { callId } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const result = await client.rejectCall(callId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Platform From Message
  fastify.post('/:session/get-platform-from-message', {
    schema: {
      tags: ['Misc'],
      summary: 'Get platform from message',
      description: 'Gets the platform (Android/iOS/Web) from which a message was sent',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['messageId'],
        properties: {
          messageId: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { messageId } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const platform = await client.getPlatformFromMessage(messageId);
      return { status: 'success', response: platform };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Download Media
  fastify.post('/:session/download-media', {
    schema: {
      tags: ['Misc'],
      summary: 'Download media from message',
      description: 'Downloads media content from a message',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['messageId'],
        properties: {
          messageId: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: {
              type: 'object',
              properties: {
                data: { type: 'string', description: 'Base64 encoded media' },
                mimetype: { type: 'string' },
                filename: { type: 'string' },
              },
            },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { messageId } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const media = await client.downloadMedia(messageId);
      return { status: 'success', response: media };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Theme
  fastify.get('/:session/get-theme', {
    schema: {
      tags: ['Misc'],
      summary: 'Get WhatsApp theme',
      description: 'Gets the current WhatsApp theme (light/dark)',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const theme = await client.getTheme();
      return { status: 'success', response: theme };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Set Theme
  fastify.post('/:session/set-theme', {
    schema: {
      tags: ['Misc'],
      summary: 'Set WhatsApp theme',
      description: 'Sets the WhatsApp theme (light/dark)',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['light', 'dark'], example: 'dark' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { theme } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const result = await client.setTheme(theme);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // ===== Simplified routes using INSTANCE_NAME =====

  // Check Number - Simplified
  fastify.get('/misc/check-number/:phone', {
    schema: {
      tags: ['Misc'],
      summary: 'Check number status (simplified)',
      description: `Checks if number exists for instance: ${instanceName}`,
      params: {
        type: 'object',
        properties: {
          phone: { type: 'string', example: '5521999999999' },
        },
        required: ['phone'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { phone } = request.params;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const contactId = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.checkNumberStatus(contactId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Battery Level - Simplified
  fastify.get('/misc/battery-level', {
    schema: {
      tags: ['Misc'],
      summary: 'Get battery level (simplified)',
      description: `Gets battery level for instance: ${instanceName}`,
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const battery = await client.getBatteryLevel();
      return { status: 'success', response: battery };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Host Device - Simplified
  fastify.get('/misc/host-device', {
    schema: {
      tags: ['Misc'],
      summary: 'Get host device info (simplified)',
      description: `Gets host device for instance: ${instanceName}`,
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const hostDevice = await client.getHostDevice();
      return { status: 'success', response: hostDevice };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Connection State - Simplified
  fastify.get('/misc/connection-state', {
    schema: {
      tags: ['Misc'],
      summary: 'Get connection state (simplified)',
      description: `Gets connection state for instance: ${instanceName}`,
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const state = await client.getConnectionState();
      return { status: 'success', response: state };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });
}

module.exports = miscRoutes;
