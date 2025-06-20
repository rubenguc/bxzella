import mongoose from "mongoose";

// @ts-expect-error -- *
let cached = global.mongoose;

if (!cached) {
  // @ts-expect-error -- *
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    // @ts-expect-error -- *
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
