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

/**
 * Resolves mongodb+srv:// records directly using Google/Cloudflare public DNS
 * to bypass local macOS / ISP DNS resolvers that reject SRV record queries (EREFUSED).
 */
async function getDirectMongoUri(uri: string): Promise<string> {
  if (!uri || !uri.startsWith("mongodb+srv://")) return uri;

  try {
    const resolver = new dns.promises.Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);

    const parsed = new URL(uri.replace("mongodb+srv://", "http://"));
    const auth = parsed.username ? `${parsed.username}:${parsed.password}@` : "";
    const host = parsed.hostname;
    const db = parsed.pathname.slice(1);

    const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
    if (!srvRecords || srvRecords.length === 0) return uri;

    const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
    let txtParams = "";
    try {
      const txtRecords = await resolver.resolveTxt(host);
      txtParams = txtRecords.flat().join("&");
    } catch {
      // ignore TXT lookup error if unavailable
    }

    const originalParams = parsed.search.slice(1);
    const allParams = [txtParams, originalParams, "ssl=true"].filter(Boolean).join("&");
    return `mongodb://${auth}${hosts}/${db}?${allParams}`;
  } catch (err) {
    console.warn("[dbConnect] Public DNS SRV resolution failed, falling back to original URI:", err);
    return uri;
  }
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

    cached.promise = (async () => {
      // First try resolving via public DNS to avoid querySrv EREFUSED
      const connectionUri = await getDirectMongoUri(mongoUrl);
      try {
        return await mongoose.connect(connectionUri, opts);
      } catch (connectErr: any) {
        if (connectErr?.code === "EREFUSED" || connectErr?.message?.includes("querySrv")) {
          // If connection still failed with querySrv, try resolving one more time
          const retryUri = await getDirectMongoUri(mongoUrl);
          return await mongoose.connect(retryUri, opts);
        }
        throw connectErr;
      }
    })();
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
