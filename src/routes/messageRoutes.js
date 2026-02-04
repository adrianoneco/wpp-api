const { wppConnectService } = require('../services');
const { Message } = require('../models');

async function messageRoutes(fastify) {
  // Send text message
  fastify.post('/sessions/:sessionName/messages/text', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const { to, message } = request.body;

      if (!to || !message) {
        reply.code(400);
        return { success: false, error: 'to and message are required' };
      }

      const result = await wppConnectService.sendTextMessage(sessionName, to, message);
      return { success: true, message: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Send image message
  fastify.post('/sessions/:sessionName/messages/image', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const { to, image, caption } = request.body;

      if (!to || !image) {
        reply.code(400);
        return { success: false, error: 'to and image (base64) are required' };
      }

      const result = await wppConnectService.sendImageMessage(sessionName, to, image, caption);
      return { success: true, message: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Send file message
  fastify.post('/sessions/:sessionName/messages/file', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const { to, file, filename, mimetype, caption } = request.body;

      if (!to || !file || !filename || !mimetype) {
        reply.code(400);
        return { success: false, error: 'to, file (base64), filename, and mimetype are required' };
      }

      const result = await wppConnectService.sendFileMessage(sessionName, to, file, filename, mimetype, caption);
      return { success: true, message: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get messages from database
  fastify.get('/sessions/:sessionName/messages', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const { from, to, limit = 50, page = 1 } = request.query;

      const query = { sessionId: sessionName };
      if (from) query.from = from;
      if (to) query.to = to;

      const messages = await Message.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Message.countDocuments(query);

      return {
        success: true,
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get chats
  fastify.get('/sessions/:sessionName/chats', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const chats = await wppConnectService.getChats(sessionName);
      return { success: true, chats };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get contacts
  fastify.get('/sessions/:sessionName/contacts', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const contacts = await wppConnectService.getContacts(sessionName);
      return { success: true, contacts };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get chat messages (from WhatsApp)
  fastify.get('/sessions/:sessionName/chats/:chatId/messages', async (request, reply) => {
    try {
      const { sessionName, chatId } = request.params;
      const { count = 20 } = request.query;
      const messages = await wppConnectService.getMessages(sessionName, chatId, parseInt(count));
      return { success: true, messages };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

module.exports = messageRoutes;
