const { wppConnectService } = require('../services');
const { Session } = require('../models');
const config = require('../config');
const QRCode = require('qrcode');

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

// Helper to get base URL from request
function getBaseUrl(request) {
  const protocol = request.headers['x-forwarded-proto'] || request.protocol || 'http';
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  return `${protocol}://${host}`;
}

async function sessionRoutes(fastify) {
  // === Default instance routes (uses INSTANCE_NAME from env) ===
  
  // Get default instance status
  fastify.get('/session/status', {
    schema: {
      tags: ['Sessions'],
      summary: 'Status da instância padrão',
      description: `Retorna o status da instância configurada (${config.instance.name})`,
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
              },
            },
          },
        },
        404: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const status = await wppConnectService.getSessionStatus(config.instance.name);
      
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

  // Get QR code for default instance
  fastify.get('/session/qrcode', {
    schema: {
      tags: ['Sessions'],
      summary: 'Obter QR Code da instância padrão',
      description: `Retorna o QR Code da instância configurada (${config.instance.name})`,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            qrCode: {
              type: 'string',
              description: 'QR Code em formato base64 (data:image/png;base64,...)',
            },
          },
        },
        404: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const qrCode = await wppConnectService.getQrCode(config.instance.name);
      
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

  // Get QR code as PNG image for default instance (regenerated at 400x400)
  fastify.get('/session/qrcode.png', {
    schema: {
      tags: ['Sessions'],
      summary: 'Baixar QR Code como imagem PNG (400x400)',
      description: `Retorna o QR Code da instância configurada (${config.instance.name}) como arquivo PNG regenerado em alta resolução`,
      produces: ['image/png'],
      response: {
        200: {
          description: 'QR Code PNG image',
          type: 'string',
          format: 'binary'
        },
        404: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      // Try to get qrCodeUrl first for regeneration
      const session = await Session.findOne({ name: config.instance.name });
      
      if (session?.qrCodeUrl) {
        // Regenerate QR code from URL at higher resolution
        const qrBuffer = await QRCode.toBuffer(session.qrCodeUrl, {
          errorCorrectionLevel: 'M',
          type: 'png',
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        reply
          .type('image/png')
          .header('Content-Disposition', `inline; filename="qrcode-${config.instance.name}.png"`)
          .header('Cache-Control', 'no-cache, no-store, must-revalidate')
          .send(qrBuffer);
        return;
      }
      
      // Fallback to stored base64 image
      const qrCode = await wppConnectService.getQrCode(config.instance.name);
      
      if (!qrCode) {
        reply.code(404);
        return { success: false, error: 'QR Code not available' };
      }
      
      const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      reply
        .type('image/png')
        .header('Content-Disposition', `inline; filename="qrcode-${config.instance.name}.png"`)
        .header('Cache-Control', 'no-cache, no-store, must-revalidate')
        .send(imageBuffer);
    } catch (error) {
      console.error('Error processing QR code image:', error);
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Display QR code as HTML page (easier to scan)
  fastify.get('/session/qrcode/scan', {
    schema: {
      tags: ['Sessions'],
      summary: 'Pagina para escanear QR Code',
      description: `Exibe o QR Code da instância (${config.instance.name}) em uma pagina HTML para facilitar o escaneamento`,
      produces: ['text/html'],
    },
  }, async (request, reply) => {
    try {
      const baseUrl = getBaseUrl(request);
      const session = await Session.findOne({ name: config.instance.name });
      const status = await wppConnectService.getSessionStatus(config.instance.name);
      
      // Check if connected - redirect to monitor
      if (status?.status === 'authenticated' || status?.status === 'connected') {
        reply.redirect(`${baseUrl}/api/session/monitor`);
        return;
      }
      
      // Generate QR code from URL if available
      let qrCodeDataUrl = session?.qrCode;
      
      if (session?.qrCodeUrl) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(session.qrCodeUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 400,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (qrErr) {
          console.error('Error regenerating QR code:', qrErr);
        }
      }
      
      if (!qrCodeDataUrl) {
        const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>QR Code - ${config.instance.name.toUpperCase()}</title>
<meta http-equiv="refresh" content="3">
<style>body{font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;}</style>
</head><body>
<h2>Aguardando QR Code...</h2>
<p>Status: ${status?.status || 'unknown'}</p>
<p>Esta pagina atualiza automaticamente.</p>
</body></html>`;
        reply.type('text/html; charset=utf-8').send(html);
        return;
      }
      
      const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>QR Code - ${config.instance.name.toUpperCase()}</title>
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
<div class="status">Instancia: ${config.instance.name.toUpperCase()}</div>
<p class="info">Abra o WhatsApp - Aparelhos conectados - Conectar aparelho</p>
</div>
</body></html>`;
      
      reply.type('text/html; charset=utf-8').header('Cache-Control', 'no-cache').send(html);
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Close default instance session
  fastify.delete('/session', {
    schema: {
      tags: ['Sessions'],
      summary: 'Encerrar instância padrão',
      description: `Encerra a instância configurada (${config.instance.name})`,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const result = await wppConnectService.closeSession(config.instance.name);
      return result;
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Take screenshot of browser
  fastify.get('/session/screenshot', {
    schema: {
      tags: ['Sessions'],
      summary: 'Capturar screenshot do browser',
      description: `Captura uma imagem da tela do browser da instância (${config.instance.name})`,
      produces: ['image/png'],
      response: {
        200: {
          description: 'Screenshot PNG image',
          type: 'string',
          format: 'binary'
        },
        404: errorResponse,
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const screenshot = await wppConnectService.takeScreenshot(config.instance.name);
      const imageBuffer = Buffer.from(screenshot, 'base64');
      
      reply
        .type('image/png')
        .header('Content-Disposition', `inline; filename="screenshot-${config.instance.name}-${Date.now()}.png"`)
        .header('Cache-Control', 'no-cache, no-store, must-revalidate')
        .send(imageBuffer);
    } catch (error) {
      console.error('Screenshot error:', error);
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Screenshot as base64 JSON
  fastify.get('/session/screenshot/base64', {
    schema: {
      tags: ['Sessions'],
      summary: 'Capturar screenshot como base64',
      description: `Captura uma imagem da tela do browser em formato base64`,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            screenshot: { type: 'string' },
            timestamp: { type: 'number' },
          },
        },
        500: errorResponse,
      },
    },
  }, async (request, reply) => {
    try {
      const screenshot = await wppConnectService.takeScreenshot(config.instance.name);
      return { 
        success: true, 
        screenshot: `data:image/png;base64,${screenshot}`,
        timestamp: Date.now()
      };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // MJPEG-like streaming endpoint (returns JPEG frames)
  fastify.get('/session/stream/frame', {
    schema: {
      tags: ['Sessions'],
      summary: 'Capturar frame do browser (JPEG)',
      description: `Captura um frame JPEG para streaming`,
      produces: ['image/jpeg'],
    },
  }, async (request, reply) => {
    try {
      const frame = await wppConnectService.getScreenshotStream(config.instance.name);
      
      reply
        .type('image/jpeg')
        .header('Cache-Control', 'no-cache, no-store, must-revalidate')
        .header('Pragma', 'no-cache')
        .header('Expires', '0')
        .send(frame);
    } catch (error) {
      // Return a placeholder image on error
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Browser monitor page
  fastify.get('/session/monitor', {
    schema: {
      tags: ['Sessions'],
      summary: 'Página de monitoramento do browser',
      description: `Exibe streaming do browser com opções de screenshot e compartilhamento`,
      produces: ['text/html'],
    },
  }, async (request, reply) => {
    const baseUrl = getBaseUrl(request);
    const status = await wppConnectService.getSessionStatus(config.instance.name);
    
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Monitor - ${config.instance.name.toUpperCase()}</title>
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
.btn:active { transform: translateY(0); }
.btn-primary { background: #00d9ff; color: #1a1a2e; }
.btn-success { background: #00c853; color: #fff; }
.btn-warning { background: #ff9100; color: #fff; }
.btn-danger { background: #ff5252; color: #fff; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
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
@media (max-width: 600px) {
  .controls { flex-direction: column; width: 100%; }
  .btn { width: 100%; justify-content: center; }
}
</style>
</head>
<body>
<div class="header">
  <h1>📱 ${config.instance.name.toUpperCase()}</h1>
  <span class="status-badge ${status?.status === 'connected' || status?.status === 'authenticated' ? 'status-connected' : 'status-disconnected'}" id="statusBadge">
    ${status?.status || 'unknown'}
  </span>
</div>

<div class="main">
  <div class="stream-container">
    <img id="browserStream" src="${baseUrl}/api/session/stream/frame" alt="Browser Stream">
  </div>
  
  <div class="controls">
    <button class="btn btn-primary" onclick="toggleStream()" id="streamBtn">
      <span>⏸️</span> Pausar Stream
    </button>
    <button class="btn btn-success" onclick="takeScreenshot()">
      <span>📸</span> Screenshot
    </button>
    <button class="btn btn-warning" onclick="shareScreen()">
      <span>📡</span> Compartilhar (WebRTC)
    </button>
    <button class="btn btn-danger" onclick="window.location.href='${baseUrl}/api/session/qrcode/scan'">
      <span>📲</span> QR Code
    </button>
  </div>

  <div class="info-panel">
    <div class="info-row">
      <span class="info-label">Instância</span>
      <span class="info-value">${config.instance.name}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status</span>
      <span class="info-value" id="statusText">${status?.status || 'unknown'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Telefone</span>
      <span class="info-value" id="phoneText">${status?.phoneNumber || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Base URL</span>
      <span class="info-value">${baseUrl}</span>
    </div>
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
    
    if (streaming) {
      requestAnimationFrame(() => setTimeout(updateStream, 100)); // ~10 FPS
    }
  };
  img.onerror = () => {
    if (streaming) {
      setTimeout(updateStream, 1000);
    }
  };
  img.src = baseUrl + '/api/session/stream/frame?t=' + Date.now();
}

function toggleStream() {
  streaming = !streaming;
  if (streaming) {
    streamBtn.innerHTML = '<span>⏸️</span> Pausar Stream';
    updateStream();
  } else {
    streamBtn.innerHTML = '<span>▶️</span> Iniciar Stream';
    fpsCounter.textContent = 'FPS: 0';
  }
}

async function takeScreenshot() {
  try {
    const response = await fetch(baseUrl + '/api/session/screenshot/base64');
    const data = await response.json();
    
    if (data.success) {
      currentScreenshot = data.screenshot;
      document.getElementById('screenshotImg').src = data.screenshot;
      document.getElementById('screenshotModal').classList.add('active');
    } else {
      alert('Erro ao capturar screenshot: ' + data.error);
    }
  } catch (error) {
    alert('Erro: ' + error.message);
  }
}

function closeModal() {
  document.getElementById('screenshotModal').classList.remove('active');
}

function downloadScreenshot() {
  if (!currentScreenshot) return;
  
  const link = document.createElement('a');
  link.href = currentScreenshot;
  link.download = 'screenshot-${config.instance.name}-' + Date.now() + '.png';
  link.click();
}

async function shareScreen() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    // Fallback: open stream in new window for manual sharing
    window.open(baseUrl + '/api/session/monitor/fullscreen', '_blank');
    alert('Para compartilhar via WebRTC, abra a nova janela e use o compartilhamento de tela do seu navegador/aplicativo de videoconferência.');
    return;
  }
  
  try {
    // Create a canvas to draw the stream
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Stream the canvas
    const stream = canvas.captureStream(10);
    
    // Draw frames to canvas
    function drawFrame() {
      ctx.drawImage(streamImg, 0, 0, canvas.width, canvas.height);
      if (streaming) {
        requestAnimationFrame(drawFrame);
      }
    }
    drawFrame();
    
    // Copy stream URL to clipboard
    const streamUrl = baseUrl + '/api/session/monitor/fullscreen';
    await navigator.clipboard.writeText(streamUrl);
    alert('URL copiada para área de transferência!\\n\\n' + streamUrl + '\\n\\nCompartilhe esta URL ou use o compartilhamento de tela do seu navegador para transmitir via WebRTC.');
    
  } catch (error) {
    console.error('Share error:', error);
    const streamUrl = baseUrl + '/api/session/monitor/fullscreen';
    prompt('Copie esta URL para compartilhar:', streamUrl);
  }
}

// Update status periodically
async function updateStatus() {
  try {
    const response = await fetch(baseUrl + '/api/session/status');
    const data = await response.json();
    
    if (data.success && data.session) {
      document.getElementById('statusText').textContent = data.session.status || 'unknown';
      document.getElementById('phoneText').textContent = data.session.phoneNumber || 'N/A';
      
      const badge = document.getElementById('statusBadge');
      badge.textContent = data.session.status || 'unknown';
      badge.className = 'status-badge ' + 
        (data.session.status === 'connected' || data.session.status === 'authenticated' ? 'status-connected' : 'status-disconnected');
    }
  } catch (e) {}
}

// Start streaming
updateStream();
setInterval(updateStatus, 5000);

// Close modal on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
</script>
</body>
</html>`;
    
    reply.type('text/html; charset=utf-8').send(html);
  });

  // Fullscreen monitor (for sharing)
  fastify.get('/session/monitor/fullscreen', {
    schema: {
      tags: ['Sessions'],
      summary: 'Monitor em tela cheia para compartilhamento',
      produces: ['text/html'],
    },
  }, async (request, reply) => {
    const baseUrl = getBaseUrl(request);
    
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Stream - ${config.instance.name.toUpperCase()}</title>
<style>
* { margin: 0; padding: 0; }
body { background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
img { max-width: 100%; max-height: 100vh; }
</style>
</head>
<body>
<img id="stream" src="${baseUrl}/api/session/stream/frame" alt="Stream">
<script>
const img = document.getElementById('stream');
const baseUrl = '${baseUrl}';

function updateFrame() {
  const newImg = new Image();
  newImg.onload = () => {
    img.src = newImg.src;
    setTimeout(updateFrame, 100);
  };
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

module.exports = sessionRoutes;
