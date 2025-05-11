import mongoose from 'mongoose';

// Check if we're on the server side before connecting
const isServer = typeof window === 'undefined';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/raiseit';

// Cache the MongoDB connection to reuse between API calls
let cached = isServer ? (global.mongoose || { conn: null, promise: null }) : { conn: null, promise: null };
if (isServer && !global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  // Don't connect on client side
  if (!isServer) {
    console.warn('Attempting to connect to MongoDB from the browser. This operation is skipped.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase; 