import mongoose from "mongoose";
import dns from "node:dns";

// Fix for macOS / ISP DNS servers that REFUSE SRV lookups for mongodb+srv://
try {
  if (typeof dns.setServers === "function") {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  }
} catch (dnsErr) {
  console.warn("Could not set custom DNS servers:", dnsErr);
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error(
      "MONGO_URL is not defined in environment variables. Please check your .env.local file."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongoUrl, opts).then((mongooseInstance) => {
      return mongooseInstance;
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

export default dbConnect;
