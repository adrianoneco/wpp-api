const { wppConnectService } = require('../services');
const { Message } = require('../models');
const config = require('../config');

// Schema definitions
const sessionNameParam = {
  type: 'object',
  properties: {
    sessionName: { type: 'string', description: 'Nome da sessão WhatsApp' },
  },
  required: ['sessionName'],
};

const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: { type: 'string' },
  },
};

const phoneNumber = {
  type: 'string',
  description: 'Número de telefone com código do país (ex: 5511999999999)',
};

async function messageRoutes(fastify) {
  // === Default instance routes (uses INSTANCE_NAME from env) ===
  
  // Send text message using default instance
  fastify.post('/messages/text', {
    schema: {
      tags: ['Messages'],
      summary: 'Enviar mensagem de texto (instância padrão)',
      description: `Envia mensagem usando a instância configurada (${config.instance.name})`,
      body: {
        type: 'object',
        required: ['to', 'message'],
        properties: {
          to: phoneNumber,
          message: {
            type: 'string',
            description: 'Conteúdo da mensagem',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'object' },
          },
        },
        400: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const { to, message } = request.body;

      if (!to || !message) {
        reply.code(400);
        return { success: false, error: 'to and message are required' };
      }

      const result = await wppConnectService.sendTextMessage(config.instance.name, to, message);
      return { success: true, message: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Send image message using default instance
  fastify.post('/messages/image', {
    schema: {
      tags: ['Messages'],
      summary: 'Enviar imagem (instância padrão)',
      description: `Envia imagem usando a instância configurada (${config.instance.name})`,
      body: {
        type: 'object',
        required: ['to', 'image'],
        properties: {
          to: phoneNumber,
          image: {
            type: 'string',
            description: 'Imagem em formato base64',
          },
          caption: {
            type: 'string',
            description: 'Legenda da imagem (opcional)',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'object' },
          },
        },
        400: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const { to, image, caption } = request.body;

      if (!to || !image) {
        reply.code(400);
        return { success: false, error: 'to and image (base64) are required' };
      }

      const result = await wppConnectService.sendImageMessage(config.instance.name, to, image, caption);
      return { success: true, message: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Send file message using default instance
  fastify.post('/messages/file', {
    schema: {
      tags: ['Messages'],
      summary: 'Enviar arquivo (instância padrão)',
      description: `Envia arquivo usando a instância configurada (${config.instance.name})`,
      body: {
        type: 'object',
        required: ['to', 'file', 'filename', 'mimetype'],
        properties: {
          to: phoneNumber,
          file: {
            type: 'string',
            description: 'Arquivo em formato base64',
          },
          filename: {
            type: 'string',
            description: 'Nome do arquivo com extensão',
          },
          mimetype: {
            type: 'string',
            description: 'Tipo MIME do arquivo',
          },
          caption: {
            type: 'string',
            description: 'Legenda do arquivo (opcional)',
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'object' },
          },
        },
        400: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const { to, file, filename, mimetype, caption } = request.body;

      if (!to || !file || !filename || !mimetype) {
        reply.code(400);
        return { success: false, error: 'to, file (base64), filename, and mimetype are required' };
      }

      const result = await wppConnectService.sendFileMessage(config.instance.name, to, file, filename, mimetype, caption);
      return { success: true, message: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

module.exports = messageRoutes;
