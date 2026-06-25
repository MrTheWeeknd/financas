import mongoose from "mongoose";
import { connectDatabase } from "../_server/database";
import { CardModel, CategoryModel, ResponsibleModel, StoreLotModel, TransactionModel } from "../_server/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasMongoUri = Boolean(process.env.MONGODB_URI);
  let database = "not_configured";
  let counts = null;
  let error = null;

  if (hasMongoUri) {
    try {
      await connectDatabase();
      database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
      counts = {
        cards: await CardModel.countDocuments(),
        categories: await CategoryModel.countDocuments(),
        responsibles: await ResponsibleModel.countDocuments(),
        storeLots: await StoreLotModel.countDocuments(),
        transactions: await TransactionModel.countDocuments(),
      };
    } catch (err) {
      database = "error";
      error = err instanceof Error ? err.message : "Erro desconhecido ao conectar no MongoDB.";
    }
  }

  return Response.json({
    status: "ok",
    service: "controle-financeiro-next-api",
    hasMongoUri,
    database,
    counts,
    error,
    timestamp: new Date().toISOString(),
  });
}
