const mongoose = require('mongoose');
const config = require('./index');

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
