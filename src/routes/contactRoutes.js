const { wppConnectService } = require('../services');
const config = require('../config');

async function contactRoutes(fastify) {
  // All Contacts
  fastify.get('/:session/all-contacts', {
    schema: {
      tags: ['Contact'],
      summary: 'Get all contacts',
      description: 'Retrieves all contacts including non-saved contacts',
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
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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
      const contacts = await client.getAllContacts();
      return { status: 'success', response: contacts };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Contact
  fastify.get('/:session/contact/:phone', {
    schema: {
      tags: ['Contact'],
      summary: 'Get contact by phone number',
      description: 'Retrieves contact information by phone number',
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
            response: { type: 'object' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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
      const contact = await client.getContact(contactId);
      return { status: 'success', response: contact };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Profile Picture
  fastify.get('/:session/profile-pic/:phone', {
    schema: {
      tags: ['Contact'],
      summary: 'Get profile picture URL',
      description: 'Retrieves the profile picture URL of a contact',
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
            response: { type: 'string' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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
      const pic = await client.getProfilePicFromServer(contactId);
      return { status: 'success', response: pic };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Profile Status
  fastify.get('/:session/profile-status/:phone', {
    schema: {
      tags: ['Contact'],
      summary: 'Get profile status message',
      description: 'Retrieves the status message of a contact',
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
            response: { type: 'string' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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
      const statusMsg = await client.getStatus(contactId);
      return { status: 'success', response: statusMsg?.status || '' };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Check Number Status
  fastify.get('/:session/check-number-status/:phone', {
    schema: {
      tags: ['Contact'],
      summary: 'Check if number exists on WhatsApp',
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
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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

  // Get Number Profile
  fastify.get('/:session/number-profile/:phone', {
    schema: {
      tags: ['Contact'],
      summary: 'Get number profile',
      description: 'Retrieves profile information of a phone number',
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
            response: { type: 'object' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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
      const profile = await client.getNumberProfile(contactId);
      return { status: 'success', response: profile };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Is Connected
  fastify.get('/:session/is-connected', {
    schema: {
      tags: ['Contact'],
      summary: 'Check if session is connected',
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

  // Block Contact
  fastify.post('/:session/block-contact', {
    schema: {
      tags: ['Contact'],
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
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Unblock Contact
  fastify.post('/:session/unblock-contact', {
    schema: {
      tags: ['Contact'],
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
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Blocklist
  fastify.get('/:session/blocklist', {
    schema: {
      tags: ['Contact'],
      summary: 'Get blocked contacts list',
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
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
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

  // ===== Simplified routes using INSTANCE_NAME =====
  const instanceName = config.instance.name;

  // All Contacts - Simplified
  fastify.get('/contacts/all', {
    schema: {
      tags: ['Contact'],
      summary: 'Get all contacts (simplified)',
      description: `Gets all contacts for instance: ${instanceName}`,
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'object' } },
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
      const contacts = await client.getAllContacts();
      return { status: 'success', response: contacts };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Contact by phone - Simplified
  fastify.get('/contacts/:phone', {
    schema: {
      tags: ['Contact'],
      summary: 'Get contact by phone (simplified)',
      description: `Gets contact for instance: ${instanceName}`,
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
      const contact = await client.getContact(contactId);
      return { status: 'success', response: contact };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Check Number - Simplified
  fastify.get('/contacts/check/:phone', {
    schema: {
      tags: ['Contact'],
      summary: 'Check number status (simplified)',
      description: `Checks if number exists on WhatsApp for instance: ${instanceName}`,
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

  // Blocklist - Simplified
  fastify.get('/contacts/blocklist', {
    schema: {
      tags: ['Contact'],
      summary: 'Get blocklist (simplified)',
      description: `Gets blocked contacts for instance: ${instanceName}`,
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'object' } },
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
      const list = await client.getBlockList();
      return { status: 'success', response: list };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Block - Simplified
  fastify.post('/contacts/block', {
    schema: {
      tags: ['Contact'],
      summary: 'Block contact (simplified)',
      description: `Blocks a contact for instance: ${instanceName}`,
      body: {
        type: 'object',
        properties: {
          phone: { type: 'string' },
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
      const { phone } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const contactId = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.blockContact(contactId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Unblock - Simplified
  fastify.post('/contacts/unblock', {
    schema: {
      tags: ['Contact'],
      summary: 'Unblock contact (simplified)',
      description: `Unblocks a contact for instance: ${instanceName}`,
      body: {
        type: 'object',
        properties: {
          phone: { type: 'string' },
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
      const { phone } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const contactId = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.unblockContact(contactId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });
}

module.exports = contactRoutes;
