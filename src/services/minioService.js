const Minio = require('minio');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class MinioService {
  constructor() {
    this.client = new Minio.Client({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
    this.bucket = config.minio.bucket;
  }

  async initialize() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        console.log(`✅ MinIO bucket '${this.bucket}' created`);
      } else {
        console.log(`✅ MinIO bucket '${this.bucket}' already exists`);
      }
      return true;
    } catch (error) {
      console.error('❌ MinIO initialization error:', error.message);
      throw error;
    }
  }

  async uploadFile(buffer, mimetype, filename = null) {
    try {
      const objectName = filename || `${uuidv4()}-${Date.now()}`;
      const metaData = {
        'Content-Type': mimetype,
      };

      await this.client.putObject(this.bucket, objectName, buffer, buffer.length, metaData);
      
      const url = await this.getFileUrl(objectName);
      return {
        objectName,
        bucket: this.bucket,
        url,
        size: buffer.length,
        mimetype,
      };
    } catch (error) {
      console.error('Error uploading file to MinIO:', error.message);
      throw error;
    }
  }

  async uploadBase64(base64Data, mimetype, filename = null) {
    const buffer = Buffer.from(base64Data, 'base64');
    return this.uploadFile(buffer, mimetype, filename);
  }

  async getFileUrl(objectName, expiry = 24 * 60 * 60) {
    try {
      return await this.client.presignedGetObject(this.bucket, objectName, expiry);
    } catch (error) {
      console.error('Error getting file URL from MinIO:', error.message);
      throw error;
    }
  }

  async getFile(objectName) {
    try {
      return await this.client.getObject(this.bucket, objectName);
    } catch (error) {
      console.error('Error getting file from MinIO:', error.message);
      throw error;
    }
  }

  async deleteFile(objectName) {
    try {
      await this.client.removeObject(this.bucket, objectName);
      return true;
    } catch (error) {
      console.error('Error deleting file from MinIO:', error.message);
      throw error;
    }
  }

  async listFiles(prefix = '') {
    try {
      const objects = [];
      const stream = this.client.listObjects(this.bucket, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objects.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(objects));
      });
    } catch (error) {
      console.error('Error listing files from MinIO:', error.message);
      throw error;
    }
  }
}

module.exports = new MinioService();
