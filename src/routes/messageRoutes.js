const { wppConnectService } = require('../services');
const { Message } = require('../models');
const config = require('../config');

async function messageRoutes(fastify) {
  const instanceName = config.instance.name;

  // Send Text Message
  fastify.post('/:session/send-message', {
    schema: {
      tags: ['Messages'],
      summary: 'Send text message',
      description: 'Sends a text message to a phone or group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'message'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          message: { type: 'string', example: 'Hello World!' },
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
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { phone, message, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendText(chatId, message);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Image
  fastify.post('/:session/send-image', {
    schema: {
      tags: ['Messages'],
      summary: 'Send image',
      description: 'Sends an image with optional caption',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'base64'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          base64: { type: 'string', description: 'Base64 encoded image' },
          filename: { type: 'string', example: 'image.jpg' },
          caption: { type: 'string', example: 'Check this out!' },
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
      const { phone, base64, filename, caption, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendImage(chatId, base64, filename || 'image.jpg', caption || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Sticker
  fastify.post('/:session/send-sticker', {
    schema: {
      tags: ['Messages'],
      summary: 'Send sticker',
      description: 'Sends a sticker image',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'path'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          path: { type: 'string', description: 'Base64 or URL of image' },
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
      const { phone, path, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendImageAsSticker(chatId, path);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Sticker GIF
  fastify.post('/:session/send-sticker-gif', {
    schema: {
      tags: ['Messages'],
      summary: 'Send animated sticker',
      description: 'Sends an animated GIF as sticker',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'path'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          path: { type: 'string', description: 'Base64 or URL of animated image' },
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
      const { phone, path, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendImageAsStickerGif(chatId, path);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Reply
  fastify.post('/:session/send-reply', {
    schema: {
      tags: ['Messages'],
      summary: 'Send reply',
      description: 'Sends a reply to a specific message',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'message', 'messageId'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          message: { type: 'string', example: 'This is a reply' },
          messageId: { type: 'string', description: 'ID of message to reply to' },
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
      const { phone, message, messageId, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.reply(chatId, message, messageId);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send File
  fastify.post('/:session/send-file', {
    schema: {
      tags: ['Messages'],
      summary: 'Send file',
      description: 'Sends a file (PDF, document, etc.)',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'base64', 'filename'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          base64: { type: 'string', description: 'Base64 encoded file' },
          filename: { type: 'string', example: 'document.pdf' },
          caption: { type: 'string', example: 'Important document' },
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
      const { phone, base64, filename, caption, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendFile(chatId, base64, filename, caption || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send File from Base64
  fastify.post('/:session/send-file-base64', {
    schema: {
      tags: ['Messages'],
      summary: 'Send file from base64',
      description: 'Sends a file from base64 encoded content',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'base64', 'filename'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          base64: { type: 'string', description: 'Base64 encoded file with mimetype prefix' },
          filename: { type: 'string', example: 'document.pdf' },
          caption: { type: 'string', example: 'Document caption' },
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
      const { phone, base64, filename, caption, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendFileFromBase64(chatId, base64, filename, caption || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Voice
  fastify.post('/:session/send-voice', {
    schema: {
      tags: ['Messages'],
      summary: 'Send voice message',
      description: 'Sends a voice/audio message (PTT)',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'path'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          path: { type: 'string', description: 'Base64 audio or URL' },
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
      const { phone, path, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendPtt(chatId, path);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Voice from Base64
  fastify.post('/:session/send-voice-base64', {
    schema: {
      tags: ['Messages'],
      summary: 'Send voice message from base64',
      description: 'Sends a voice/audio message from base64',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'base64'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          base64: { type: 'string', description: 'Base64 encoded audio' },
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
      const { phone, base64, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendPttFromBase64(chatId, base64, 'audio.mp3');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Location
  fastify.post('/:session/send-location', {
    schema: {
      tags: ['Messages'],
      summary: 'Send location',
      description: 'Sends a location pin',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'lat', 'lng'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          lat: { type: 'string', example: '-23.5505' },
          lng: { type: 'string', example: '-46.6333' },
          title: { type: 'string', example: 'My Location' },
          address: { type: 'string', example: 'São Paulo, Brazil' },
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
      const { phone, lat, lng, title, address, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendLocation(chatId, lat, lng, title || '', address || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Link Preview
  fastify.post('/:session/send-link-preview', {
    schema: {
      tags: ['Messages'],
      summary: 'Send link with preview',
      description: 'Sends a link with automatic preview',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'url'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          url: { type: 'string', example: 'https://example.com' },
          caption: { type: 'string', example: 'Check this link!' },
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
      const { phone, url, caption, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendLinkPreview(chatId, url, caption || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Mention
  fastify.post('/:session/send-mention', {
    schema: {
      tags: ['Messages'],
      summary: 'Send message with mentions',
      description: 'Sends a message mentioning specific users',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'message', 'mentioned'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: true },
          message: { type: 'string', example: 'Hello @5521999999999!' },
          mentioned: { type: 'array', items: { type: 'string' }, example: ['5521999999999'] },
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
      const { phone, message, mentioned, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const formattedMentioned = mentioned.map(m => m.includes('@') ? m : `${m}@c.us`);
      const result = await client.sendMentioned(chatId, message, formattedMentioned);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Buttons
  fastify.post('/:session/send-buttons', {
    schema: {
      tags: ['Messages'],
      summary: 'Send message with buttons',
      description: 'Sends a message with interactive buttons',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'title', 'buttons'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          title: { type: 'string', example: 'Choose an option' },
          description: { type: 'string', example: 'Select one of the buttons below' },
          footer: { type: 'string', example: 'Footer text' },
          buttons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                buttonId: { type: 'string' },
                buttonText: { type: 'object', properties: { displayText: { type: 'string' } } },
                type: { type: 'integer' },
              },
            },
          },
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
      const { phone, title, description, footer, buttons, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendButtons(chatId, title, buttons, description || '', footer || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send List Message
  fastify.post('/:session/send-list-message', {
    schema: {
      tags: ['Messages'],
      summary: 'Send list message',
      description: 'Sends a message with a selectable list',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'title', 'buttonText', 'sections'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          title: { type: 'string', example: 'Menu Options' },
          description: { type: 'string', example: 'Choose from the list' },
          buttonText: { type: 'string', example: 'View Options' },
          footer: { type: 'string', example: 'Footer text' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                rows: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rowId: { type: 'string' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
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
      const { phone, title, description, buttonText, footer, sections, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendListMessage(chatId, {
        title,
        description: description || '',
        buttonText,
        footer: footer || '',
        sections,
      });
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Poll Message
  fastify.post('/:session/send-poll-message', {
    schema: {
      tags: ['Messages'],
      summary: 'Send poll message',
      description: 'Sends a poll message with options',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'name', 'options'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          name: { type: 'string', example: 'What is your favorite color?' },
          options: { type: 'array', items: { type: 'string' }, example: ['Red', 'Blue', 'Green'] },
          selectableCount: { type: 'integer', example: 1 },
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
      const { phone, name, options, selectableCount, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.sendPollMessage(chatId, name, options, { selectableCount: selectableCount || 1 });
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send Contact VCard
  fastify.post('/:session/send-contact-vcard', {
    schema: {
      tags: ['Messages'],
      summary: 'Send contact vCard',
      description: 'Sends a contact as vCard',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'contactName', 'contactPhone'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          contactName: { type: 'string', example: 'John Doe' },
          contactPhone: { type: 'string', example: '5521888888888' },
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
      const { phone, contactName, contactPhone, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const contactId = contactPhone.includes('@') ? contactPhone : `${contactPhone}@c.us`;
      const result = await client.sendContactVcard(chatId, contactId, contactName);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Edit Message
  fastify.put('/:session/edit-message', {
    schema: {
      tags: ['Messages'],
      summary: 'Edit message',
      description: 'Edits a sent message',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['messageId', 'newText'],
        properties: {
          messageId: { type: 'string', description: 'ID of message to edit' },
          newText: { type: 'string', example: 'Edited message content' },
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
      const { session } = request.params;
      const { messageId, newText } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const result = await client.editMessage(messageId, newText);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Delete Message
  fastify.delete('/:session/delete-message', {
    schema: {
      tags: ['Messages'],
      summary: 'Delete message',
      description: 'Deletes a message',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'messageId'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          messageId: { type: 'string', description: 'ID of message to delete' },
          deleteForEveryone: { type: 'boolean', default: false },
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
      const { phone, messageId, deleteForEveryone, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.deleteMessage(chatId, messageId, deleteForEveryone);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Forward Messages
  fastify.post('/:session/forward-messages', {
    schema: {
      tags: ['Messages'],
      summary: 'Forward messages',
      description: 'Forwards messages to another chat',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['phone', 'messageId'],
        properties: {
          phone: { type: 'string', example: '5521999999999' },
          isGroup: { type: 'boolean', default: false },
          messageId: { type: 'string', description: 'ID of message to forward' },
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
      const { phone, messageId, isGroup } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (phone.includes('@') ? phone : `${phone}@g.us`)
        : (phone.includes('@') ? phone : `${phone}@c.us`);

      const result = await client.forwardMessages(chatId, [messageId], false);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // React to Message
  fastify.post('/:session/react-message', {
    schema: {
      tags: ['Messages'],
      summary: 'React to message',
      description: 'Adds a reaction emoji to a message',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['messageId', 'reaction'],
        properties: {
          messageId: { type: 'string', description: 'ID of message to react to' },
          reaction: { type: 'string', example: '👍', description: 'Emoji reaction' },
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
      const { messageId, reaction } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const result = await client.sendReactionToMessage(messageId, reaction);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Star Message
  fastify.post('/:session/star-message', {
    schema: {
      tags: ['Messages'],
      summary: 'Star/unstar message',
      description: 'Stars or unstars a message',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['messageId', 'star'],
        properties: {
          messageId: { type: 'string', description: 'ID of message to star' },
          star: { type: 'boolean', default: true, description: 'true to star, false to unstar' },
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
      const { messageId, star } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const result = await client.starMessage(messageId, star);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Get Media by Message
  fastify.post('/:session/get-media-by-message', {
    schema: {
      tags: ['Messages'],
      summary: 'Get media from message',
      description: 'Downloads media from a message',
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
          messageId: { type: 'string', description: 'ID of message containing media' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string', description: 'Base64 encoded media' },
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

  // ===== Simplified routes using INSTANCE_NAME =====

  // Send text message - Simplified
  fastify.post('/messages/text', {
    schema: {
      tags: ['Messages'],
      summary: 'Send text message (simplified)',
      description: `Sends text message using instance: ${instanceName}`,
      body: {
        type: 'object',
        required: ['to', 'message'],
        properties: {
          to: { type: 'string', example: '5521999999999' },
          message: { type: 'string', example: 'Hello World!' },
          isGroup: { type: 'boolean', default: false },
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
      },
    },
  }, async (request, reply) => {
    try {
      const { to, message, isGroup } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (to.includes('@') ? to : `${to}@g.us`)
        : (to.includes('@') ? to : `${to}@c.us`);

      const result = await client.sendText(chatId, message);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send image - Simplified
  fastify.post('/messages/image', {
    schema: {
      tags: ['Messages'],
      summary: 'Send image (simplified)',
      description: `Sends image using instance: ${instanceName}`,
      body: {
        type: 'object',
        required: ['to', 'base64'],
        properties: {
          to: { type: 'string', example: '5521999999999' },
          base64: { type: 'string', description: 'Base64 encoded image' },
          filename: { type: 'string', example: 'image.jpg' },
          caption: { type: 'string', example: 'Check this out!' },
          isGroup: { type: 'boolean', default: false },
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
      },
    },
  }, async (request, reply) => {
    try {
      const { to, base64, filename, caption, isGroup } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (to.includes('@') ? to : `${to}@g.us`)
        : (to.includes('@') ? to : `${to}@c.us`);

      const result = await client.sendImage(chatId, base64, filename || 'image.jpg', caption || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send file - Simplified
  fastify.post('/messages/file', {
    schema: {
      tags: ['Messages'],
      summary: 'Send file (simplified)',
      description: `Sends file using instance: ${instanceName}`,
      body: {
        type: 'object',
        required: ['to', 'base64', 'filename'],
        properties: {
          to: { type: 'string', example: '5521999999999' },
          base64: { type: 'string', description: 'Base64 encoded file' },
          filename: { type: 'string', example: 'document.pdf' },
          caption: { type: 'string', example: 'Important document' },
          isGroup: { type: 'boolean', default: false },
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
      },
    },
  }, async (request, reply) => {
    try {
      const { to, base64, filename, caption, isGroup } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (to.includes('@') ? to : `${to}@g.us`)
        : (to.includes('@') ? to : `${to}@c.us`);

      const result = await client.sendFile(chatId, base64, filename, caption || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send voice - Simplified
  fastify.post('/messages/voice', {
    schema: {
      tags: ['Messages'],
      summary: 'Send voice message (simplified)',
      description: `Sends voice message using instance: ${instanceName}`,
      body: {
        type: 'object',
        required: ['to', 'base64'],
        properties: {
          to: { type: 'string', example: '5521999999999' },
          base64: { type: 'string', description: 'Base64 encoded audio' },
          isGroup: { type: 'boolean', default: false },
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
      },
    },
  }, async (request, reply) => {
    try {
      const { to, base64, isGroup } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (to.includes('@') ? to : `${to}@g.us`)
        : (to.includes('@') ? to : `${to}@c.us`);

      const result = await client.sendPttFromBase64(chatId, base64, 'audio.mp3');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Send location - Simplified
  fastify.post('/messages/location', {
    schema: {
      tags: ['Messages'],
      summary: 'Send location (simplified)',
      description: `Sends location using instance: ${instanceName}`,
      body: {
        type: 'object',
        required: ['to', 'lat', 'lng'],
        properties: {
          to: { type: 'string', example: '5521999999999' },
          lat: { type: 'string', example: '-23.5505' },
          lng: { type: 'string', example: '-46.6333' },
          title: { type: 'string', example: 'My Location' },
          address: { type: 'string', example: 'São Paulo, Brazil' },
          isGroup: { type: 'boolean', default: false },
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
      },
    },
  }, async (request, reply) => {
    try {
      const { to, lat, lng, title, address, isGroup } = request.body;
      const client = wppConnectService.getClient(instanceName);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }

      const chatId = isGroup 
        ? (to.includes('@') ? to : `${to}@g.us`)
        : (to.includes('@') ? to : `${to}@c.us`);

      const result = await client.sendLocation(chatId, lat, lng, title || '', address || '');
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });
}

module.exports = messageRoutes;
