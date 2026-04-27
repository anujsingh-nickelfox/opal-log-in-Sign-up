import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI && typeof window === 'undefined') {
  console.error('❌ DATABASE_URL or MONGODB_URI environment variable is not set.');
  console.error('❌ Database connection will fail.');
  console.error('🔍 Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('MONGO')));
  console.error('💡 In Vercel: Go to Settings → Environment Variables and add DATABASE_URL');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Atlas Connected Successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('💡 Check: 1) DATABASE_URL is set in Vercel env vars');
      console.error('💡 Check: 2) MongoDB Atlas Network Access allows 0.0.0.0/0');
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
