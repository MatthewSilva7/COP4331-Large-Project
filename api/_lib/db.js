import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI is not configured.");
}

const globalForMongoose = globalThis;

if (!globalForMongoose.__mongooseConnectionPromise) {
  globalForMongoose.__mongooseConnectionPromise = mongoose.connect(mongoUri, {
    bufferCommands: false,
  });
}

export const connectToDatabase = async () => {
  await globalForMongoose.__mongooseConnectionPromise;
};
