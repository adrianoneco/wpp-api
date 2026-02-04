const { wppConnectService } = require('../services');
const config = require('../config');

async function chatRoutes(fastify) {
  const sessionName = config.instance.name;

  // All Chats (deprecated)
  fastify.get('/:session/all-chats', {
    schema: {
      tags: ['Chat'],
      summary: 'Deprecated in favor of list-chats',
      description: 'This body is not required. Not sent body to get all chats or filter.',
      deprecated: true,
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      querystring: {
        type: 'object',
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'string', example: 'false' },
          includeMe: { type: 'string', example: 'true' },
          includeNotifications: { type: 'string', example: 'false' },
        },
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
      const chats = await client.getAllChats();
      return { status: 'success', response: chats };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // List Chats
  fastify.post('/:session/list-chats', {
    schema: {
      tags: ['Chat'],
      summary: 'Retrieve a list of chats',
      description: 'This body is not required. Not sent body to get all chats or filter.',
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
          id: { type: 'string' },
          count: { type: 'number' },
          direction: { type: 'string' },
          onlyGroups: { type: 'boolean' },
          onlyUsers: { type: 'boolean' },
          onlyWithUnreadMessage: { type: 'boolean' },
          withLabels: { type: 'array', items: { type: 'string' } },
        },
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
      const { onlyGroups, onlyUsers, onlyWithUnreadMessage, count } = request.body || {};
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      let chats = await client.getAllChats();
      
      if (onlyGroups) chats = chats.filter(c => c.isGroup);
      if (onlyUsers) chats = chats.filter(c => !c.isGroup);
      if (onlyWithUnreadMessage) chats = chats.filter(c => c.unreadCount > 0);
      if (count) chats = chats.slice(0, count);
      
      return { status: 'success', response: chats };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // All Chats Archived
  fastify.get('/:session/all-chats-archived', {
    schema: {
      tags: ['Chat'],
      summary: 'Get all archived chats',
      description: 'Retrieves all archived chats.',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
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
      const chats = await client.getAllChats();
      const archived = chats.filter(c => c.archive);
      reply.code(201);
      return { status: 'success', response: archived };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // All Chats With Messages (deprecated)
  fastify.get('/:session/all-chats-with-messages', {
    schema: {
      tags: ['Chat'],
      summary: 'Deprecated in favor of list-chats',
      deprecated: true,
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
      const chats = await client.getAllChatsWithMessages();
      return { status: 'success', response: chats };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // All Messages In Chat
  fastify.get('/:session/all-messages-in-chat/:phone', {
    schema: {
      tags: ['Chat'],
      summary: 'Get all messages in chat',
      description: 'Retrieves all messages from a specific chat',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          phone: { type: 'string', example: '5521999999999' },
        },
        required: ['session', 'phone'],
      },
      querystring: {
        type: 'object',
        properties: {
          isGroup: { type: 'string', example: 'false' },
          includeMe: { type: 'string', example: 'true' },
          includeNotifications: { type: 'string', example: 'true' },
        },
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
      const { session, phone } = request.params;
      const { isGroup, includeMe, includeNotifications } = request.query;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup === 'true' ? `${phone}@g.us` : `${phone}@c.us`;
      const messages = await client.getAllMessagesInChat(chatId, includeMe !== 'false', includeNotifications !== 'false');
      return { status: 'success', response: messages };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // All New Messages
  fastify.get('/:session/all-new-messages', {
    schema: {
      tags: ['Chat'],
      summary: 'Get all new messages',
      description: 'Retrieves all new/unread messages',
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
      const messages = await client.getAllNewMessages();
      return { status: 'success', response: messages };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // All Unread Messages
  fastify.get('/:session/all-unread-messages', {
    schema: {
      tags: ['Chat'],
      summary: 'Get all unread messages',
      description: 'Retrieves all unread messages from all chats',
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
      const messages = await client.getAllUnreadMessages();
      return { status: 'success', response: messages };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Chat By Id
  fastify.get('/:session/chat-by-id/:phone', {
    schema: {
      tags: ['Chat'],
      summary: 'Get chat by ID',
      description: 'Retrieves a specific chat by phone number or group ID',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          phone: { type: 'string', example: '5521999999999' },
        },
        required: ['session', 'phone'],
      },
      querystring: {
        type: 'object',
        properties: {
          isGroup: { type: 'string', example: 'false' },
        },
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
      const { isGroup } = request.query;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup === 'true' ? `${phone}@g.us` : `${phone}@c.us`;
      const chat = await client.getChatById(chatId);
      return { status: 'success', response: chat };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Message By Id
  fastify.get('/:session/message-by-id/:messageId', {
    schema: {
      tags: ['Chat'],
      summary: 'Get message by ID',
      description: 'Retrieves a specific message by its ID',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          messageId: { type: 'string', example: '<message_id>' },
        },
        required: ['session', 'messageId'],
      },
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { session, messageId } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const message = await client.getMessageById(messageId);
      return { status: 'success', response: message };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Chat Is Online
  fastify.get('/:session/chat-is-online/:phone', {
    schema: {
      tags: ['Chat'],
      summary: 'Check if chat is online',
      description: 'Checks if a contact is currently online',
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
            response: { type: 'boolean' },
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
      const result = await client.getContact(`${phone}@c.us`);
      return { status: 'success', response: result?.isOnline || false };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Last Seen
  fastify.get('/:session/last-seen/:phone', {
    schema: {
      tags: ['Chat'],
      summary: 'Get last seen',
      description: 'Gets the last seen timestamp of a contact',
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
            response: { type: 'number' },
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
      const lastSeen = await client.getLastSeen(`${phone}@c.us`);
      return { status: 'success', response: lastSeen };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // List Mutes
  fastify.get('/:session/list-mutes/:type', {
    schema: {
      tags: ['Chat'],
      summary: 'List muted chats',
      description: 'Lists all muted chats of specified type',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          type: { type: 'string', example: 'all' },
        },
        required: ['session', 'type'],
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
      const { session, type } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const mutes = await client.getListMutes(type);
      return { status: 'success', response: mutes };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Load Messages In Chat (deprecated)
  fastify.get('/:session/load-messages-in-chat/:phone', {
    schema: {
      tags: ['Chat'],
      summary: 'Load messages in chat (deprecated)',
      deprecated: true,
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          phone: { type: 'string', example: '5521999999999' },
        },
        required: ['session', 'phone'],
      },
      querystring: {
        type: 'object',
        properties: {
          includeMe: { type: 'string', example: 'true' },
          includeNotifications: { type: 'string', example: 'false' },
        },
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
      const { session, phone } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const messages = await client.loadAndGetAllMessagesInChat(`${phone}@c.us`);
      return { status: 'success', response: messages };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Contact
  fastify.get('/:session/contact/:phone', {
    schema: {
      tags: ['Chat'],
      summary: 'Get contact info',
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
      const contact = await client.getContact(`${phone}@c.us`);
      return { status: 'success', response: contact };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Archive Chat
  fastify.post('/:session/archive-chat', {
    schema: {
      tags: ['Chat'],
      summary: 'Archive chat',
      description: 'Archives or unarchives a chat',
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
          isGroup: { type: 'boolean' },
          value: { type: 'boolean' },
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
      const { phone, isGroup, value } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      const result = await client.archiveChat(chatId, value);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Archive All Chats
  fastify.post('/:session/archive-all-chats', {
    schema: {
      tags: ['Chat'],
      summary: 'Archive all chats',
      description: 'Archives all chats',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
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
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chats = await client.getAllChats();
      for (const chat of chats) {
        await client.archiveChat(chat.id._serialized, true);
      }
      
      reply.code(201);
      return { status: 'success', response: true };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Clear Chat
  fastify.post('/:session/clear-chat', {
    schema: {
      tags: ['Chat'],
      summary: 'Clear chat',
      description: 'Clears all messages from a chat',
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
          isGroup: { type: 'boolean' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { phone, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      const result = await client.clearChat(chatId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Clear All Chats
  fastify.post('/:session/clear-all-chats', {
    schema: {
      tags: ['Chat'],
      summary: 'Clear all chats',
      description: 'Clears all messages from all chats',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
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
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chats = await client.getAllChats();
      for (const chat of chats) {
        await client.clearChat(chat.id._serialized);
      }
      
      reply.code(201);
      return { status: 'success', response: true };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Delete Chat
  fastify.post('/:session/delete-chat', {
    schema: {
      tags: ['Chat'],
      summary: 'Delete chat',
      description: 'Deletes a chat',
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
          isGroup: { type: 'boolean' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { phone, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      const result = await client.deleteChat(chatId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Delete All Chats
  fastify.post('/:session/delete-all-chats', {
    schema: {
      tags: ['Chat'],
      summary: 'Delete all chats',
      description: 'Deletes all chats',
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
      
      const chats = await client.getAllChats();
      for (const chat of chats) {
        await client.deleteChat(chat.id._serialized);
      }
      
      return { status: 'success', response: true };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Pin Chat
  fastify.post('/:session/pin-chat', {
    schema: {
      tags: ['Chat'],
      summary: 'Pin chat',
      description: 'Pins or unpins a chat',
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
          isGroup: { type: 'boolean' },
          state: { type: 'boolean' },
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
      const { phone, isGroup, state } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      const result = await client.pinChat(chatId, state);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Mute
  fastify.post('/:session/send-mute', {
    schema: {
      tags: ['Chat'],
      summary: 'Mute chat',
      description: 'Mutes a chat for a specified duration',
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
          isGroup: { type: 'boolean' },
          time: { type: 'number' },
          type: { type: 'string' },
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
      const { phone, isGroup, time, type } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      // Calculate mute time in seconds
      let muteTime = time;
      if (type === 'hours') muteTime = time * 3600;
      if (type === 'days') muteTime = time * 86400;
      
      const result = await client.setMute(chatId, muteTime);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Seen
  fastify.post('/:session/send-seen', {
    schema: {
      tags: ['Chat'],
      summary: 'Mark chat as seen',
      description: 'Marks all messages in a chat as read/seen',
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
          isGroup: { type: 'boolean' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { phone, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      const result = await client.sendSeen(chatId);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Chat State (deprecated)
  fastify.post('/:session/chat-state', {
    schema: {
      tags: ['Chat'],
      summary: 'Set chat state (deprecated)',
      deprecated: true,
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
          isGroup: { type: 'boolean' },
          chatstate: { type: 'string' },
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
      const { phone, isGroup, chatstate } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      // chatstate: 0 = stop, 1 = typing, 2 = recording
      if (chatstate === '1') {
        await client.startTyping(chatId);
      } else if (chatstate === '2') {
        await client.startRecording(chatId);
      } else {
        await client.stopTyping(chatId);
      }
      return { status: 'success', response: true };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Typing
  fastify.post('/:session/typing', {
    schema: {
      tags: ['Chat'],
      summary: 'Set typing status',
      description: 'Shows typing indicator in chat',
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
          isGroup: { type: 'boolean' },
          value: { type: 'boolean' },
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
      const { phone, isGroup, value } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      if (value) {
        await client.startTyping(chatId);
      } else {
        await client.stopTyping(chatId);
      }
      return { status: 'success', response: true };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Recording
  fastify.post('/:session/recording', {
    schema: {
      tags: ['Chat'],
      summary: 'Set recording status',
      description: 'Shows recording indicator in chat',
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
          isGroup: { type: 'boolean' },
          duration: { type: 'number' },
          value: { type: 'boolean' },
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
      const { phone, isGroup, value, duration } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const chatId = isGroup ? `${phone}@g.us` : `${phone}@c.us`;
      if (value) {
        await client.startRecording(chatId);
        if (duration) {
          setTimeout(async () => {
            try { await client.stopRecording(chatId); } catch {}
          }, duration * 1000);
        }
      } else {
        await client.stopRecording(chatId);
      }
      return { status: 'success', response: true };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });
}

module.exports = chatRoutes;
