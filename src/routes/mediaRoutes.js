const { minioService } = require('../services');

async function mediaRoutes(fastify) {
  // Upload file
  fastify.post('/media/upload', async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.code(400);
        return { success: false, error: 'No file provided' };
      }

      const buffer = await data.toBuffer();
      const result = await minioService.uploadFile(buffer, data.mimetype, data.filename);
      
      return { success: true, file: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Upload base64 file
  fastify.post('/media/upload/base64', async (request, reply) => {
    try {
      const { data, mimetype, filename } = request.body;

      if (!data || !mimetype) {
        reply.code(400);
        return { success: false, error: 'data (base64) and mimetype are required' };
      }

      const result = await minioService.uploadBase64(data, mimetype, filename);
      return { success: true, file: result };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Get file URL
  fastify.get('/media/:objectName', async (request, reply) => {
    try {
      const { objectName } = request.params;
      const url = await minioService.getFileUrl(decodeURIComponent(objectName));
      return { success: true, url };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Delete file
  fastify.delete('/media/:objectName', async (request, reply) => {
    try {
      const { objectName } = request.params;
      await minioService.deleteFile(decodeURIComponent(objectName));
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // List files
  fastify.get('/media', async (request, reply) => {
    try {
      const { prefix } = request.query;
      const files = await minioService.listFiles(prefix);
      return { success: true, files };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

module.exports = mediaRoutes;
