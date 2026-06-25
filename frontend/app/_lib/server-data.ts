import { connectDatabase } from "../_server/database";
import {
  getBillingSummary as getBillingSummaryFromRepository,
  getDashboard as getDashboardFromRepository,
  listCards,
  listCategories,
  listResponsibles,
  listStoreLots,
  listTransactions,
} from "../_server/repository";

async function withDatabase<T>(read: () => Promise<T>) {
  await connectDatabase();
  return read();
}

export function getDashboard(scope = "all") {
  return withDatabase(() => getDashboardFromRepository(scope));
}

export function getCards() {
  return withDatabase(listCards);
}

export function getResponsibles() {
  return withDatabase(listResponsibles);
}

export function getCategories() {
  return withDatabase(listCategories);
}

export function getTransactions() {
  return withDatabase(listTransactions);
}

export function getStoreLots() {
  return withDatabase(listStoreLots);
}

export function getBillingSummary(responsibleId: string, month: string) {
  if (!responsibleId) return null;
  return withDatabase(() => getBillingSummaryFromRepository(responsibleId, month));
}
