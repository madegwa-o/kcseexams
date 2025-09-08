// lib/mongodb.ts
import { MongoClient } from "mongodb";

export const EXAMS_DATABASE_NAME =
    process.env.EXAMS_DATABASE_NAME || "kcse_exams_edb";
export const GENERAL_DATABASE_NAME =
    process.env.GENERAL_DATABASE_NAME || "kcse_exams_gdb";

const uri = process.env.MONGODB_ATLAS_URI as string;
if (!uri) {
    throw new Error("MONGODB_ATLAS_URI is not set in environment variables");
}
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Extend the global type to include our cached client promise
declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// In development, use a global variable so we don’t create a new client on every hot reload
if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production, just create a new client once
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
