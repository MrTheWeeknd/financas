import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.info("MONGODB_URI não informado. Rodando com dados mockados.");
    return;
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 2500,
  });
  console.info("MongoDB conectado.");
}
