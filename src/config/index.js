require('dotenv').config();

const instanceName = process.env.INSTANCE_NAME || 'default';
// Each instance now has its own volume, so we use /data directly
const dataPath = '/data';

module.exports = {
  // Server Configuration
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
    publicUrl: process.env.PUBLIC_URL || process.env.SWAGGER_SERVER_URL || `http://localhost:${parseInt(process.env.PORT, 10) || 3000}`,
  },

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wpp-api',
  },

  // MinIO S3 Configuration
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'wpp-media',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },

  // WPPConnect Configuration
  wppconnect: {
    sessionName: process.env.WPP_SESSION_NAME || 'wpp-session',
    headless: process.env.WPP_HEADLESS !== 'false',
  },

  // Instance Configuration (for fixed instance mode)
  instance: {
    name: instanceName,
    appProvider: process.env.APP_PROVIDER || 'WPPC',
    dataPath: dataPath,
    tokensPath: `${dataPath}/tokens`,
    cachePath: `${dataPath}/cache`,
  },
};
