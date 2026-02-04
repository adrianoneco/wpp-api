const { wppConnectService } = require('../services');
const { Session } = require('../models');
const config = require('../config');
const QRCode = require('qrcode');

// Helper to get base URL from request
function getBaseUrl(request) {
  const protocol = request.headers['x-forwarded-proto'] || request.protocol || 'http';
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  return `${protocol}://${host}`;
}

async function authRoutes(fastify) {
  const sessionName = config.instance.name;

  // Generate Token
  fastify.post('/:session/:secretkey/generate-token', {
    schema: {
      tags: ['Auth'],
      summary: 'Generate authentication token',
      description: 'Generates a JWT token for API authentication',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          secretkey: { type: 'string', example: 'THISISMYSECURETOKEN' },
        },
        required: ['session', 'secretkey'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            session: { type: 'string' },
            token: { type: 'string' },
            full: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, secretkey } = request.params;
      // Token generation logic here - simplified for now
      const token = Buffer.from(`${session}:${secretkey}:${Date.now()}`).toString('base64');
      reply.code(201);
      return {
        status: 'success',
        session,
        token,
        full: `Bearer ${token}`,
      };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Show All Sessions
  fastify.get('/:secretkey/show-all-sessions', {
    schema: {
      tags: ['Auth'],
      summary: 'Show all sessions',
      description: 'Lists all available WhatsApp sessions',
      operationId: 'showAllSessions',
      params: {
        type: 'object',
        properties: {
          secretkey: { type: 'string', example: 'THISISMYSECURETOKEN' },
        },
        required: ['secretkey'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            sessions: { type: 'array', items: { type: 'object' } },
          },
        },
        400: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const activeSessions = wppConnectService.getAllSessions();
      const dbSessions = await Session.find({});
      
      const sessions = dbSessions.map(s => ({
        name: s.name,
        status: activeSessions.includes(s.name) ? 'active' : 'inactive',
        isConnected: s.isConnected,
        phoneNumber: s.phoneNumber,
        updatedAt: s.updatedAt,
      }));
      
      return { status: 'success', sessions };
    } catch (error) {
      reply.code(400);
      return { status: 'error', message: error.message };
    }
  });

  // Start All Sessions
  fastify.post('/:secretkey/start-all', {
    schema: {
      tags: ['Auth'],
      summary: 'Start all sessions',
      description: 'Starts all configured WhatsApp sessions',
      operationId: 'startAllSessions',
      params: {
        type: 'object',
        properties: {
          secretkey: { type: 'string', example: 'THISISMYSECURECODE' },
        },
        required: ['secretkey'],
      },
      querystring: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const dbSessions = await Session.find({});
      const started = [];
      
      for (const session of dbSessions) {
        try {
          await wppConnectService.initializeInstanceSession(session.name);
          started.push(session.name);
        } catch (err) {
          console.error(`Failed to start ${session.name}:`, err.message);
        }
      }
      
      reply.code(201);
      return { status: 'success', message: `Started ${started.length} sessions`, started };
    } catch (error) {
      reply.code(400);
      return { status: 'error', message: error.message };
    }
  });

  // Check Connection State
  fastify.get('/:session/check-connection-session', {
    schema: {
      tags: ['Auth'],
      summary: 'Check connection state',
      description: 'Checks if the session is connected to WhatsApp',
      operationId: 'CheckConnectionState',
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
            state: { type: 'string' },
            isConnected: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const status = await wppConnectService.getSessionStatus(session);
      return {
        status: 'success',
        state: status?.status || 'disconnected',
        isConnected: status?.isConnected || false,
      };
    } catch (error) {
      return { status: 'error', state: 'disconnected', isConnected: false };
    }
  });

  // Get QR Code Session
  fastify.get('/:session/qrcode-session', {
    schema: {
      tags: ['Auth'],
      summary: 'Get QR Code',
      description: 'Returns the QR Code for WhatsApp Web authentication',
      operationId: 'getQrCode',
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
            qrcode: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const dbSession = await Session.findOne({ name: session });
      
      if (dbSession?.qrCodeUrl) {
        const qrcode = await QRCode.toDataURL(dbSession.qrCodeUrl, {
          errorCorrectionLevel: 'M',
          width: 400,
        });
        return { status: 'success', qrcode };
      }
      
      const qrcode = await wppConnectService.getQrCode(session);
      if (!qrcode) {
        reply.code(500);
        return { status: 'error', message: 'QR Code not available' };
      }
      
      return { status: 'success', qrcode };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Start Session
  fastify.post('/:session/start-session', {
    schema: {
      tags: ['Auth'],
      summary: 'Start session',
      description: 'Starts a WhatsApp session',
      operationId: 'startSession',
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
          webhook: { type: 'string' },
          waitQrCode: { type: 'boolean' },
          proxy: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              username: { type: 'string' },
              password: { type: 'string' },
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            session: { type: 'string' },
            state: { type: 'string' },
            qrcode: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { webhook, waitQrCode } = request.body || {};
      
      await wppConnectService.initializeInstanceSession(session);
      const status = await wppConnectService.getSessionStatus(session);
      
      const response = {
        status: 'success',
        session,
        state: status?.status || 'starting',
      };
      
      if (waitQrCode) {
        const qrcode = await wppConnectService.getQrCode(session);
        if (qrcode) response.qrcode = qrcode;
      }
      
      return response;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  });

  // Logout Session
  fastify.post('/:session/logout-session', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout session',
      description: 'This route logout and delete session data',
      operationId: 'logoutSession',
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
            message: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const result = await wppConnectService.closeSession(session);
      await Session.deleteOne({ name: session });
      return { status: 'success', message: 'Session logged out and data deleted' };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Close Session
  fastify.post('/:session/close-session', {
    schema: {
      tags: ['Auth'],
      summary: 'Close session',
      description: 'Closes the WhatsApp session without deleting data',
      operationId: 'closeSession',
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
            message: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const result = await wppConnectService.closeSession(session);
      return { status: 'success', message: 'Session closed' };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Status Session
  fastify.get('/:session/status-session', {
    schema: {
      tags: ['Auth'],
      summary: 'Get session status',
      description: 'Returns the current status of the session',
      operationId: 'statusSession',
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
            session: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                state: { type: 'string' },
                isConnected: { type: 'boolean' },
                phoneNumber: { type: 'string' },
              },
            },
          },
        },
        500: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const status = await wppConnectService.getSessionStatus(session);
      
      return {
        status: 'success',
        session: {
          name: session,
          state: status?.status || 'disconnected',
          isConnected: status?.isConnected || false,
          phoneNumber: status?.phoneNumber || null,
        },
      };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // ==========================================
  // Simplified routes using INSTANCE_NAME
  // ==========================================
  
  // Get Status (uses default instance)
  fastify.get('/session/status', {
    schema: {
      tags: ['Auth'],
      summary: 'Get default instance status',
      description: `Returns the status of the configured instance (${sessionName})`,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            session: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                status: { type: 'string' },
                isConnected: { type: 'boolean' },
                phoneNumber: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const status = await wppConnectService.getSessionStatus(sessionName);
      return {
        success: true,
        session: {
          name: sessionName,
          status: status?.status || 'disconnected',
          isConnected: status?.isConnected || false,
          phoneNumber: status?.phoneNumber || null,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get QR Code (uses default instance)
  fastify.get('/session/qrcode', {
    schema: {
      tags: ['Auth'],
      summary: 'Get default instance QR Code',
      description: `Returns the QR Code for the configured instance (${sessionName})`,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            qrCode: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const dbSession = await Session.findOne({ name: sessionName });
      
      if (dbSession?.qrCodeUrl) {
        const qrCode = await QRCode.toDataURL(dbSession.qrCodeUrl, {
          errorCorrectionLevel: 'M',
          width: 400,
        });
        return { success: true, qrCode };
      }
      
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

  // QR Code Image PNG
  fastify.get('/session/qrcode.png', {
    schema: {
      tags: ['Auth'],
      summary: 'Download QR Code as PNG image (400x400)',
      description: `Returns the QR Code as a high-resolution PNG file`,
      produces: ['image/png'],
      response: {
        200: {
          description: 'QR Code PNG image',
          type: 'string',
          format: 'binary',
        },
      },
    },
  }, async (request, reply) => {
    try {
      const session = await Session.findOne({ name: sessionName });
      
      if (session?.qrCodeUrl) {
        const qrBuffer = await QRCode.toBuffer(session.qrCodeUrl, {
          errorCorrectionLevel: 'M',
          type: 'png',
          width: 400,
          margin: 2,
        });
        
        reply
          .type('image/png')
          .header('Content-Disposition', `inline; filename="qrcode-${sessionName}.png"`)
          .header('Cache-Control', 'no-cache')
          .send(qrBuffer);
        return;
      }
      
      const qrCode = await wppConnectService.getQrCode(sessionName);
      if (!qrCode) {
        reply.code(404);
        return { success: false, error: 'QR Code not available' };
      }
      
      const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      reply
        .type('image/png')
        .header('Content-Disposition', `inline; filename="qrcode-${sessionName}.png"`)
        .header('Cache-Control', 'no-cache')
        .send(imageBuffer);
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // QR Code Scan Page
  fastify.get('/session/qrcode/scan', {
    schema: {
      tags: ['Auth'],
      summary: 'QR Code scan page',
      description: 'Displays an HTML page with the QR Code for easy scanning',
      produces: ['text/html'],
    },
  }, async (request, reply) => {
    try {
      const baseUrl = getBaseUrl(request);
      const session = await Session.findOne({ name: sessionName });
      const status = await wppConnectService.getSessionStatus(sessionName);
      
      if (status?.status === 'authenticated' || status?.status === 'connected') {
        reply.redirect(`${baseUrl}/api/session/monitor`);
        return;
      }
      
      let qrCodeDataUrl = session?.qrCode;
      
      if (session?.qrCodeUrl) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(session.qrCodeUrl, {
            errorCorrectionLevel: 'M',
            width: 400,
            margin: 2,
          });
        } catch (err) {
          console.error('Error regenerating QR code:', err);
        }
      }
      
      if (!qrCodeDataUrl) {
        const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>QR Code - ${sessionName.toUpperCase()}</title>
<meta http-equiv="refresh" content="3">
<style>body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;}</style>
</head><body>
<h2>Aguardando QR Code...</h2>
<p>Status: ${status?.status || 'unknown'}</p>
<p>Esta página atualiza automaticamente.</p>
</body></html>`;
        reply.type('text/html; charset=utf-8').send(html);
        return;
      }
      
      const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>QR Code - ${sessionName.toUpperCase()}</title>
<meta http-equiv="refresh" content="30">
<style>
body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;}
.qr-container{background:white;padding:40px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
img{display:block;width:400px;height:400px;}
h2{margin:0 0 20px;color:#128C7E;}
.status{margin-top:20px;padding:10px 20px;background:#e8f5e9;border-radius:10px;color:#2e7d32;font-weight:bold;}
.info{margin-top:15px;color:#666;font-size:14px;}
</style>
</head><body>
<div class="qr-container">
<h2>Escaneie o QR Code</h2>
<img src="${qrCodeDataUrl}" alt="QR Code WhatsApp">
<div class="status">Instância: ${sessionName.toUpperCase()}</div>
<p class="info">Abra o WhatsApp > Aparelhos conectados > Conectar aparelho</p>
</div>
</body></html>`;
      
      reply.type('text/html; charset=utf-8').header('Cache-Control', 'no-cache').send(html);
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Close default instance
  fastify.delete('/session', {
    schema: {
      tags: ['Auth'],
      summary: 'Close default instance',
      description: `Closes the configured instance (${sessionName})`,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      await wppConnectService.closeSession(sessionName);
      return { success: true, message: 'Session closed' };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Screenshot
  fastify.get('/session/screenshot', {
    schema: {
      tags: ['Auth'],
      summary: 'Take screenshot of browser',
      description: 'Captures a screenshot of the WhatsApp Web browser',
      produces: ['image/png'],
    },
  }, async (request, reply) => {
    try {
      const screenshot = await wppConnectService.takeScreenshot(sessionName);
      const imageBuffer = Buffer.from(screenshot, 'base64');
      
      reply
        .type('image/png')
        .header('Content-Disposition', `inline; filename="screenshot-${sessionName}-${Date.now()}.png"`)
        .header('Cache-Control', 'no-cache')
        .send(imageBuffer);
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Screenshot base64
  fastify.get('/session/screenshot/base64', {
    schema: {
      tags: ['Auth'],
      summary: 'Take screenshot as base64',
      description: 'Captures a screenshot and returns it as base64',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            screenshot: { type: 'string' },
            timestamp: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const screenshot = await wppConnectService.takeScreenshot(sessionName);
      return {
        success: true,
        screenshot: `data:image/png;base64,${screenshot}`,
        timestamp: Date.now(),
      };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Stream frame
  fastify.get('/session/stream/frame', {
    schema: {
      tags: ['Auth'],
      summary: 'Get browser stream frame (JPEG)',
      description: 'Captures a JPEG frame for streaming',
      produces: ['image/jpeg'],
    },
  }, async (request, reply) => {
    try {
      const frame = await wppConnectService.getScreenshotStream(sessionName);
      
      reply
        .type('image/jpeg')
        .header('Cache-Control', 'no-cache, no-store, must-revalidate')
        .send(frame);
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Monitor page
  fastify.get('/session/monitor', {
    schema: {
      tags: ['Auth'],
      summary: 'Browser monitoring page',
      description: 'Displays a live stream of the browser with controls',
      produces: ['text/html'],
    },
  }, async (request, reply) => {
    const baseUrl = getBaseUrl(request);
    const status = await wppConnectService.getSessionStatus(sessionName);
    
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Monitor - ${sessionName.toUpperCase()}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #fff; min-height: 100vh; }
.header { background: #16213e; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.header h1 { font-size: 1.2rem; color: #00d9ff; }
.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.status-connected { background: #00c853; color: #fff; }
.status-disconnected { background: #ff5252; color: #fff; }
.main { display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 20px; }
.stream-container { background: #0f0f23; border-radius: 12px; padding: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); max-width: 100%; overflow: hidden; }
#browserStream { width: 100%; max-width: 800px; height: auto; border-radius: 8px; background: #000; }
.controls { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.btn { padding: 12px 24px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.btn-primary { background: #00d9ff; color: #1a1a2e; }
.btn-success { background: #00c853; color: #fff; }
.btn-warning { background: #ff9100; color: #fff; }
.btn-danger { background: #ff5252; color: #fff; }
.info-panel { background: #16213e; padding: 15px 20px; border-radius: 8px; width: 100%; max-width: 800px; }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a4a; }
.info-row:last-child { border-bottom: none; }
.info-label { color: #888; }
.info-value { color: #00d9ff; font-weight: 500; }
.fps-counter { position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); padding: 5px 10px; border-radius: 5px; font-size: 0.8rem; }
.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; }
.modal.active { display: flex; }
.modal-content { background: #16213e; padding: 20px; border-radius: 12px; max-width: 90%; max-height: 90%; overflow: auto; }
.modal-content img { max-width: 100%; border-radius: 8px; }
.modal-close { position: absolute; top: 20px; right: 20px; font-size: 2rem; color: #fff; cursor: pointer; }
</style>
</head>
<body>
<div class="header">
  <h1>📱 ${sessionName.toUpperCase()}</h1>
  <span class="status-badge ${status?.status === 'connected' || status?.status === 'authenticated' ? 'status-connected' : 'status-disconnected'}" id="statusBadge">
    ${status?.status || 'unknown'}
  </span>
</div>
<div class="main">
  <div class="stream-container">
    <img id="browserStream" src="${baseUrl}/api/session/stream/frame" alt="Browser Stream">
  </div>
  <div class="controls">
    <button class="btn btn-primary" onclick="toggleStream()" id="streamBtn">⏸️ Pausar</button>
    <button class="btn btn-success" onclick="takeScreenshot()">📸 Screenshot</button>
    <button class="btn btn-warning" onclick="shareScreen()">📡 Compartilhar</button>
    <button class="btn btn-danger" onclick="window.location.href='${baseUrl}/api/session/qrcode/scan'">📲 QR Code</button>
  </div>
  <div class="info-panel">
    <div class="info-row"><span class="info-label">Instância</span><span class="info-value">${sessionName}</span></div>
    <div class="info-row"><span class="info-label">Status</span><span class="info-value" id="statusText">${status?.status || 'unknown'}</span></div>
    <div class="info-row"><span class="info-label">Telefone</span><span class="info-value" id="phoneText">${status?.phoneNumber || 'N/A'}</span></div>
  </div>
</div>
<div class="fps-counter" id="fpsCounter">FPS: 0</div>
<div class="modal" id="screenshotModal">
  <span class="modal-close" onclick="closeModal()">&times;</span>
  <div class="modal-content">
    <img id="screenshotImg" src="" alt="Screenshot">
    <div style="margin-top:15px;text-align:center;">
      <button class="btn btn-primary" onclick="downloadScreenshot()">💾 Baixar</button>
    </div>
  </div>
</div>
<script>
const baseUrl = '${baseUrl}';
let streaming = true;
let frameCount = 0;
let lastFpsTime = Date.now();
let currentScreenshot = null;
const streamImg = document.getElementById('browserStream');
const streamBtn = document.getElementById('streamBtn');
const fpsCounter = document.getElementById('fpsCounter');

function updateStream() {
  if (!streaming) return;
  const img = new Image();
  img.onload = () => {
    streamImg.src = img.src;
    frameCount++;
    const now = Date.now();
    if (now - lastFpsTime >= 1000) {
      fpsCounter.textContent = 'FPS: ' + frameCount;
      frameCount = 0;
      lastFpsTime = now;
    }
    if (streaming) requestAnimationFrame(() => setTimeout(updateStream, 100));
  };
  img.onerror = () => { if (streaming) setTimeout(updateStream, 1000); };
  img.src = baseUrl + '/api/session/stream/frame?t=' + Date.now();
}

function toggleStream() {
  streaming = !streaming;
  if (streaming) { streamBtn.innerHTML = '⏸️ Pausar'; updateStream(); }
  else { streamBtn.innerHTML = '▶️ Iniciar'; fpsCounter.textContent = 'FPS: 0'; }
}

async function takeScreenshot() {
  try {
    const response = await fetch(baseUrl + '/api/session/screenshot/base64');
    const data = await response.json();
    if (data.success) {
      currentScreenshot = data.screenshot;
      document.getElementById('screenshotImg').src = data.screenshot;
      document.getElementById('screenshotModal').classList.add('active');
    }
  } catch (error) { alert('Erro: ' + error.message); }
}

function closeModal() { document.getElementById('screenshotModal').classList.remove('active'); }

function downloadScreenshot() {
  if (!currentScreenshot) return;
  const link = document.createElement('a');
  link.href = currentScreenshot;
  link.download = 'screenshot-${sessionName}-' + Date.now() + '.png';
  link.click();
}

async function shareScreen() {
  const streamUrl = baseUrl + '/api/session/monitor/fullscreen';
  try { await navigator.clipboard.writeText(streamUrl); alert('URL copiada: ' + streamUrl); }
  catch { prompt('URL para compartilhar:', streamUrl); }
}

async function updateStatus() {
  try {
    const response = await fetch(baseUrl + '/api/session/status');
    const data = await response.json();
    if (data.success && data.session) {
      document.getElementById('statusText').textContent = data.session.status || 'unknown';
      document.getElementById('phoneText').textContent = data.session.phoneNumber || 'N/A';
      const badge = document.getElementById('statusBadge');
      badge.textContent = data.session.status || 'unknown';
      badge.className = 'status-badge ' + (data.session.status === 'connected' || data.session.status === 'authenticated' ? 'status-connected' : 'status-disconnected');
    }
  } catch {}
}

updateStream();
setInterval(updateStatus, 5000);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
</script>
</body>
</html>`;
    
    reply.type('text/html; charset=utf-8').send(html);
  });

  // Fullscreen monitor
  fastify.get('/session/monitor/fullscreen', {
    schema: {
      tags: ['Auth'],
      summary: 'Fullscreen monitor for sharing',
      produces: ['text/html'],
    },
  }, async (request, reply) => {
    const baseUrl = getBaseUrl(request);
    
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Stream - ${sessionName.toUpperCase()}</title>
<style>* { margin: 0; padding: 0; } body { background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; } img { max-width: 100%; max-height: 100vh; }</style>
</head>
<body>
<img id="stream" src="${baseUrl}/api/session/stream/frame" alt="Stream">
<script>
const img = document.getElementById('stream');
const baseUrl = '${baseUrl}';
function updateFrame() {
  const newImg = new Image();
  newImg.onload = () => { img.src = newImg.src; setTimeout(updateFrame, 100); };
  newImg.onerror = () => setTimeout(updateFrame, 1000);
  newImg.src = baseUrl + '/api/session/stream/frame?t=' + Date.now();
}
updateFrame();
</script>
</body>
</html>`;
    
    reply.type('text/html; charset=utf-8').send(html);
  });
}

module.exports = authRoutes;
