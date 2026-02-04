const wppconnect = require('@wppconnect-team/wppconnect');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { Session, Message } = require('../models');
const minioService = require('./minioService');

class WppConnectService {
  constructor() {
    this.sessions = new Map();
  }

  ensureDirectories() {
    const dirs = [
      config.instance.dataPath,
      config.instance.tokensPath,
      config.instance.cachePath,
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  async createSession(sessionName) {
    if (this.sessions.has(sessionName)) {
      return { success: true, message: 'Session already exists', sessionName };
    }

    try {
      // Ensure data directories exist
      this.ensureDirectories();

      // Update or create session in database
      await Session.findOneAndUpdate(
        { name: sessionName },
        { status: 'connecting' },
        { upsert: true, new: true }
      );

      const client = await wppconnect.create({
        session: sessionName,
        deviceName: `${config.instance.appProvider}_${sessionName}`.toUpperCase(),
        headless: config.wppconnect.headless,
        useChrome: false,
        folderNameToken: '/data/tokens',
        mkdirFolderToken: '',
        browserFolderPath: '/data/browser',
        autoClose: 0,
        createPathFileToken: true,
        waitForLogin: true,
        logQR: true,
        puppeteerOptions: {
          userDataDir: '/data/browser',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        },
        catchQR: async (base64Qrimg, asciiQR, attempts, urlCode) => {
          console.log(`QR Code received for session ${sessionName}, attempt ${attempts}`);
          console.log(`QR URL Code: ${urlCode}`);
          // Store both the image and the URL code
          await Session.findOneAndUpdate(
            { name: sessionName },
            { status: 'qr_code', qrCode: base64Qrimg, qrCodeUrl: urlCode }
          );
        },
        statusFind: async (statusSession, session) => {
          console.log(`Session ${session} status: ${statusSession}`);
          let status = 'connecting';
          if (statusSession === 'isLogged' || statusSession === 'inChat') {
            status = 'connected';
          } else if (statusSession === 'notLogged') {
            status = 'disconnected';
          }
          await Session.findOneAndUpdate(
            { name: sessionName },
            { status }
          );
        },
      });

      // Add session to Map immediately
      this.sessions.set(sessionName, client);

      // Set up event handlers
      this.setupEventHandlers(client, sessionName);

      // Try to get phone number if already authenticated
      try {
        const phoneNumber = await client.getWid();
        await Session.findOneAndUpdate(
          { name: sessionName },
          { 
            status: 'authenticated',
            phoneNumber: phoneNumber?._serialized || null,
            lastConnected: new Date(),
            qrCode: null,
          }
        );
      } catch (err) {
        // Not authenticated yet, keep as qr_code or connecting
        console.log(`Session ${sessionName} waiting for authentication`);
      }

      return { success: true, message: 'Session created successfully', sessionName };
    } catch (error) {
      console.error(`Error creating session ${sessionName}:`, error.message);
      await Session.findOneAndUpdate(
        { name: sessionName },
        { status: 'error', error: error.message }
      );
      throw error;
    }
  }

  setupEventHandlers(client, sessionName) {
    // Handle incoming messages
    client.onMessage(async (message) => {
      try {
        let mediaUrl = null;

        // Handle media messages
        if (message.isMedia || message.isMMS) {
          const buffer = await client.decryptFile(message);
          const upload = await minioService.uploadFile(
            buffer,
            message.mimetype,
            `${sessionName}/${message.id}.${this.getExtension(message.mimetype)}`
          );
          mediaUrl = upload.url;
        }

        // Save message to database
        await Message.create({
          sessionId: sessionName,
          messageId: message.id,
          from: message.from,
          to: message.to,
          body: message.body || '',
          type: this.getMessageType(message),
          mediaUrl,
          mimetype: message.mimetype || null,
          isFromMe: message.fromMe || false,
          timestamp: new Date(message.timestamp * 1000),
          metadata: {
            sender: message.sender,
            notifyName: message.notifyName,
            caption: message.caption,
          },
        });
      } catch (error) {
        console.error('Error handling incoming message:', error.message);
      }
    });

    // Handle state changes
    client.onStateChange(async (state) => {
      console.log(`Session ${sessionName} state changed: ${state}`);
      if (state === 'CONNECTED') {
        await Session.findOneAndUpdate(
          { name: sessionName },
          { status: 'connected', lastConnected: new Date() }
        );
      } else if (state === 'CONFLICT' || state === 'UNLAUNCHED' || state === 'UNPAIRED') {
        await Session.findOneAndUpdate(
          { name: sessionName },
          { status: 'disconnected' }
        );
      }
    });
  }

  getMessageType(message) {
    if (message.isMedia) {
      if (message.mimetype?.startsWith('image/')) return 'image';
      if (message.mimetype?.startsWith('video/')) return 'video';
      if (message.mimetype?.startsWith('audio/')) return 'audio';
      return 'document';
    }
    if (message.isSticker) return 'sticker';
    if (message.location) return 'location';
    if (message.isContactCard) return 'contact';
    return 'text';
  }

  getExtension(mimetype) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'audio/ogg': 'ogg',
      'audio/mpeg': 'mp3',
      'application/pdf': 'pdf',
    };
    return extensions[mimetype] || 'bin';
  }

  async getSession(sessionName) {
    return this.sessions.get(sessionName);
  }

  async getSessionStatus(sessionName) {
    const session = await Session.findOne({ name: sessionName });
    return session;
  }

  async getQrCode(sessionName) {
    const session = await Session.findOne({ name: sessionName });
    return session?.qrCode || null;
  }

  async closeSession(sessionName) {
    const client = this.sessions.get(sessionName);
    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error(`Error closing session ${sessionName}:`, error.message);
      }
      this.sessions.delete(sessionName);
    }
    await Session.findOneAndUpdate(
      { name: sessionName },
      { status: 'disconnected', qrCode: null }
    );
    return { success: true, message: 'Session closed' };
  }

  async sendTextMessage(sessionName, to, message) {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }

    const result = await client.sendText(to, message);
    
    // Save sent message
    await Message.create({
      sessionId: sessionName,
      messageId: result.id,
      from: result.from,
      to: result.to,
      body: message,
      type: 'text',
      isFromMe: true,
      status: 'sent',
      timestamp: new Date(),
    });

    return result;
  }

  async sendImageMessage(sessionName, to, imageBase64, caption = '') {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }

    // Upload to MinIO
    const upload = await minioService.uploadBase64(
      imageBase64,
      'image/jpeg',
      `${sessionName}/sent-${Date.now()}.jpg`
    );

    const result = await client.sendImageFromBase64(to, `data:image/jpeg;base64,${imageBase64}`, 'image.jpg', caption);
    
    // Save sent message
    await Message.create({
      sessionId: sessionName,
      messageId: result.id,
      from: result.from,
      to: result.to,
      body: caption,
      type: 'image',
      mediaUrl: upload.url,
      mimetype: 'image/jpeg',
      isFromMe: true,
      status: 'sent',
      timestamp: new Date(),
    });

    return result;
  }

  async sendFileMessage(sessionName, to, fileBase64, filename, mimetype, caption = '') {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }

    // Upload to MinIO
    const upload = await minioService.uploadBase64(
      fileBase64,
      mimetype,
      `${sessionName}/sent-${filename}`
    );

    const result = await client.sendFileFromBase64(to, `data:${mimetype};base64,${fileBase64}`, filename, caption);
    
    // Save sent message
    await Message.create({
      sessionId: sessionName,
      messageId: result.id,
      from: result.from,
      to: result.to,
      body: caption,
      type: 'document',
      mediaUrl: upload.url,
      mimetype,
      isFromMe: true,
      status: 'sent',
      timestamp: new Date(),
    });

    return result;
  }

  async getChats(sessionName) {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }
    return client.getAllChats();
  }

  async getContacts(sessionName) {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }
    return client.getAllContacts();
  }

  async getMessages(sessionName, chatId, count = 20) {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }
    return client.getMessages(chatId, { count });
  }

  getAllSessions() {
    return Array.from(this.sessions.keys());
  }

  async takeScreenshot(sessionName) {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }

    try {
      const page = client.page;
      if (!page) {
        throw new Error('Browser page not available');
      }
      
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        encoding: 'base64'
      });
      
      return screenshot;
    } catch (error) {
      console.error(`Error taking screenshot for ${sessionName}:`, error.message);
      throw error;
    }
  }

  async getScreenshotStream(sessionName) {
    const client = this.sessions.get(sessionName);
    if (!client) {
      throw new Error('Session not found or not connected');
    }

    try {
      const page = client.page;
      if (!page) {
        throw new Error('Browser page not available');
      }
      
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 70,
        fullPage: false
      });
      
      return screenshot;
    } catch (error) {
      console.error(`Error getting screenshot stream for ${sessionName}:`, error.message);
      throw error;
    }
  }

  getBrowserPage(sessionName) {
    const client = this.sessions.get(sessionName);
    if (!client) {
      return null;
    }
    return client.page || null;
  }

  async initializeInstanceSession(instanceName) {
    // Check if session already exists in memory
    if (this.sessions.has(instanceName)) {
      console.log(`✅ Session '${instanceName}' already active`);
      return { success: true, message: 'Session already active' };
    }

    // Check if session exists in database
    const existingSession = await Session.findOne({ name: instanceName });
    
    if (existingSession) {
      console.log(`📱 Restoring session '${instanceName}'...`);
    } else {
      console.log(`📱 Creating new session '${instanceName}'...`);
    }

    try {
      await this.createSession(instanceName);
      return { success: true, message: 'Session initialized' };
    } catch (error) {
      console.error(`❌ Failed to initialize session '${instanceName}':`, error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new WppConnectService();
