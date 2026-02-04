const { wppConnectService } = require('../services');
const config = require('../config');

async function profileRoutes(fastify) {
  const instanceName = config.instance.name;

  // Set Profile Picture
  fastify.post('/:session/set-profile-pic', {
    schema: {
      tags: ['Profile'],
      summary: 'Set profile picture',
      description: 'Sets the profile picture of the logged in user',
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
          path: { type: 'string', description: 'Base64 image or URL' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
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
      const { path } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.setProfilePic(path);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Profile Status
  fastify.get('/:session/profile-status', {
    schema: {
      tags: ['Profile'],
      summary: 'Get profile status',
      description: 'Gets the profile status (about) of the logged in user',
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
      
      const wid = await client.getWid();
      const statusMsg = await client.getStatus(wid);
      return { status: 'success', response: statusMsg?.status || '' };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Set Profile Status
  fastify.post('/:session/profile-status', {
    schema: {
      tags: ['Profile'],
      summary: 'Set profile status',
      description: 'Sets the profile status (about) of the logged in user',
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
          status: { type: 'string', example: 'Available' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
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
      const { status } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.setProfileStatus(status);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Change Username
  fastify.post('/:session/change-username', {
    schema: {
      tags: ['Profile'],
      summary: 'Change username',
      description: 'Changes the display name of the logged in user',
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
          name: { type: 'string', example: 'John Doe' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
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
      const { name } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.setProfileName(name);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get My Profile Pic
  fastify.get('/:session/profile-pic', {
    schema: {
      tags: ['Profile'],
      summary: 'Get my profile picture',
      description: 'Gets the profile picture of the logged in user',
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
      
      const wid = await client.getWid();
      const pic = await client.getProfilePicFromServer(wid);
      return { status: 'success', response: pic };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Wid
  fastify.get('/:session/get-wid', {
    schema: {
      tags: ['Profile'],
      summary: 'Get WhatsApp ID',
      description: 'Gets the WhatsApp ID of the logged in user',
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
      
      const wid = await client.getWid();
      return { status: 'success', response: wid };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Edit Business Profile
  fastify.post('/:session/edit-business-profile', {
    schema: {
      tags: ['Profile'],
      summary: 'Edit business profile',
      description: 'Edits business profile information (for WhatsApp Business)',
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
          description: { type: 'string', example: 'Company description' },
          email: { type: 'string', example: 'contact@company.com' },
          website: { type: 'array', items: { type: 'string' }, example: ['https://company.com'] },
          address: { type: 'string', example: '123 Main St' },
          categories: { type: 'object' },
        },
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
      const businessProfile = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.editBusinessProfile(businessProfile);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Business Profile
  fastify.get('/:session/get-business-profile/:phone', {
    schema: {
      tags: ['Profile'],
      summary: 'Get business profile',
      description: 'Gets business profile information of a contact',
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
      const profile = await client.getBusinessProfilesProducts(contactId);
      return { status: 'success', response: profile };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // ===== Simplified routes using INSTANCE_NAME =====

  // Set Profile Picture - Simplified
  fastify.post('/profile/picture', {
    schema: {
      tags: ['Profile'],
      summary: 'Set profile picture (simplified)',
      description: `Sets profile picture for instance: ${instanceName}`,
      body: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Base64 image or URL' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { path } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.setProfilePic(path);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Profile Status - Simplified
  fastify.get('/profile/status', {
    schema: {
      tags: ['Profile'],
      summary: 'Get profile status (simplified)',
      description: `Gets profile status for instance: ${instanceName}`,
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
      
      const wid = await client.getWid();
      const statusMsg = await client.getStatus(wid);
      return { status: 'success', response: statusMsg?.status || '' };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Set Profile Status - Simplified
  fastify.post('/profile/status', {
    schema: {
      tags: ['Profile'],
      summary: 'Set profile status (simplified)',
      description: `Sets profile status for instance: ${instanceName}`,
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'Available' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { status } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.setProfileStatus(status);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Change Username - Simplified
  fastify.post('/profile/name', {
    schema: {
      tags: ['Profile'],
      summary: 'Change username (simplified)',
      description: `Changes display name for instance: ${instanceName}`,
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'John Doe' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { name } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.setProfileName(name);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Wid - Simplified
  fastify.get('/profile/wid', {
    schema: {
      tags: ['Profile'],
      summary: 'Get WhatsApp ID (simplified)',
      description: `Gets the WhatsApp ID for instance: ${instanceName}`,
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
      
      const wid = await client.getWid();
      return { status: 'success', response: wid };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });
}

module.exports = profileRoutes;
