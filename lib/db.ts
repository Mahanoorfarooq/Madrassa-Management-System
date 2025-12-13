import mongoose from "mongoose";
// Register all models once to avoid MissingSchemaError during populate in API routes
import "@/lib/models";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/madrassa_management";

if (!MONGODB_URI) {
  throw new Error("براہ کرم MONGODB_URI ماحولی متغیر سیٹ کریں۔");
}

interface GlobalWithMongoose {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = (global as unknown as GlobalWithMongoose).mongoose;

if (!cached) {
  cached = (global as unknown as GlobalWithMongoose).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
