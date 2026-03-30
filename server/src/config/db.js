const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured. Add it to your environment before starting the server.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
  return mongoose.connection;
};

module.exports = connectDB;
