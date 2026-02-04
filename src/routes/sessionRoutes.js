const { wppConnectService } = require('../services');

async function sessionRoutes(fastify) {
  // Get all active sessions
  fastify.get('/sessions', async (request, reply) => {
    try {
      const sessions = wppConnectService.getAllSessions();
      return { success: true, sessions };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Create a new session
  fastify.post('/sessions', async (request, reply) => {
    try {
      const { sessionName } = request.body;
      if (!sessionName) {
        reply.code(400);
        return { success: false, error: 'sessionName is required' };
      }

      const result = await wppConnectService.createSession(sessionName);
      return result;
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get session status
  fastify.get('/sessions/:sessionName/status', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const status = await wppConnectService.getSessionStatus(sessionName);
      
      if (!status) {
        reply.code(404);
        return { success: false, error: 'Session not found' };
      }
      
      return { success: true, session: status };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get QR code for session
  fastify.get('/sessions/:sessionName/qrcode', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const qrCode = await wppConnectService.getQrCode(sessionName);
      
      if (!qrCode) {
        reply.code(404);
        return { success: false, error: 'QR Code not available' };
      }
      
      return { success: true, qrCode };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Close session
  fastify.delete('/sessions/:sessionName', async (request, reply) => {
    try {
      const { sessionName } = request.params;
      const result = await wppConnectService.closeSession(sessionName);
      return result;
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

module.exports = sessionRoutes;
