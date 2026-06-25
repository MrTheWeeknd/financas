import mongoose from "mongoose";

declare global {
  var mongooseConnection: Promise<typeof mongoose> | undefined;
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.info("MONGODB_URI não informado. Rodando com armazenamento temporário em memória.");
    return;
  }

  if (mongoose.connection.readyState === 1) return;

  globalThis.mongooseConnection ??= mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  await globalThis.mongooseConnection;
}
