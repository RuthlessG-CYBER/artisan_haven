import { MongoClient, Db, Collection, Document } from "mongodb";

const globalForMongo = globalThis as unknown as {
  client?: MongoClient;
  db?: Db;
};

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo.client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
    globalForMongo.client = new MongoClient(uri);
    await globalForMongo.client.connect();
  }
  return globalForMongo.client;
}

export async function getMongoDb(): Promise<Db> {
  if (!globalForMongo.db) {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB_NAME || "artisan_haven";
    globalForMongo.db = client.db(dbName);
  }
  return globalForMongo.db;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const db = await getMongoDb();
  return db.collection<T>(name);
}

export * from "./auth.js";
export * from "./storefront.js";
