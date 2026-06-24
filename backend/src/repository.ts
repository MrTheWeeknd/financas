import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import {
  addPayment,
  buildBillingMessage,
  buildTransaction,
  cardName,
  monthInstallmentsTotal,
  monthPaidTotal,
  responsibleName,
} from "./calculations.js";
import { CardModel, CategoryModel, ResponsibleModel, StoreLotModel, TransactionModel } from "./models.js";
import type {
  AddPaymentInput,
  BillingSummary,
  Category,
  CreateCardInput,
  CreateCategoryInput,
  CreateResponsibleInput,
  CreateTransactionInput,
  CreditCard,
  DashboardData,
  InvoiceCheck,
  Responsible,
  StoreLot,
  Transaction,
  UpdateCardInput,
  UpdateCategoryInput,
  UpdateResponsibleInput,
} from "./types.js";

const memory = {
  cards: [] as CreditCard[],
  categories: [] as Category[],
  responsibles: [] as Responsible[],
  transactions: [] as Transaction[],
  storeLots: [] as StoreLot[],
};

function hasMongo() {
  return mongoose.connection.readyState === 1;
}

async function plain<T>(query: Promise<unknown>): Promise<T> {
  const result = await query;
  return JSON.parse(JSON.stringify(result)) as T;
}

export async function listCards(): Promise<CreditCard[]> {
  return hasMongo()
    ? plain<CreditCard[]>(CardModel.find().sort({ name: 1 }).lean().exec())
    : [...memory.cards].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function createCard(input: CreateCardInput): Promise<CreditCard> {
  const card: CreditCard = {
    id: `card_${randomUUID()}`,
    name: input.name.trim(),
    dueDay: Number(input.dueDay),
    closingDay: Number(input.closingDay),
    color: input.color,
  };

  if (hasMongo()) await CardModel.create(card);
  else memory.cards.push(card);

  return card;
}

export async function updateCard(cardId: string, input: UpdateCardInput): Promise<CreditCard | null> {
  const cards = await listCards();
  const existing = cards.find((card) => card.id === cardId);
  if (!existing) return null;

  const updated: CreditCard = {
    ...existing,
    ...input,
    name: input.name?.trim() ?? existing.name,
    dueDay: input.dueDay === undefined ? existing.dueDay : Number(input.dueDay),
    closingDay: input.closingDay === undefined ? existing.closingDay : Number(input.closingDay),
  };

  if (hasMongo()) await CardModel.updateOne({ id: cardId }, updated);
  else {
    const index = memory.cards.findIndex((card) => card.id === cardId);
    if (index >= 0) memory.cards[index] = updated;
  }

  return updated;
}

export async function deleteCard(cardId: string): Promise<boolean> {
  if (hasMongo()) {
    const result = await CardModel.deleteOne({ id: cardId });
    return result.deletedCount > 0;
  }

  const initialLength = memory.cards.length;
  memory.cards = memory.cards.filter((card) => card.id !== cardId);
  return memory.cards.length !== initialLength;
}

export async function listResponsibles(): Promise<Responsible[]> {
  return hasMongo()
    ? plain<Responsible[]>(ResponsibleModel.find().sort({ name: 1 }).lean().exec())
    : [...memory.responsibles].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function createResponsible(input: CreateResponsibleInput): Promise<Responsible> {
  const responsible: Responsible = {
    id: `resp_${randomUUID()}`,
    name: input.name.trim(),
    type: input.type,
    active: Boolean(input.active),
  };

  if (hasMongo()) await ResponsibleModel.create(responsible);
  else memory.responsibles.push(responsible);

  return responsible;
}

export async function updateResponsible(
  responsibleId: string,
  input: UpdateResponsibleInput,
): Promise<Responsible | null> {
  const responsibles = await listResponsibles();
  const existing = responsibles.find((responsible) => responsible.id === responsibleId);
  if (!existing) return null;

  const updated: Responsible = {
    ...existing,
    ...input,
    name: input.name?.trim() ?? existing.name,
    active: input.active === undefined ? existing.active : Boolean(input.active),
  };

  if (hasMongo()) await ResponsibleModel.updateOne({ id: responsibleId }, updated);
  else {
    const index = memory.responsibles.findIndex((responsible) => responsible.id === responsibleId);
    if (index >= 0) memory.responsibles[index] = updated;
  }

  return updated;
}

export async function deleteResponsible(responsibleId: string): Promise<boolean> {
  if (hasMongo()) {
    const result = await ResponsibleModel.deleteOne({ id: responsibleId });
    return result.deletedCount > 0;
  }

  const initialLength = memory.responsibles.length;
  memory.responsibles = memory.responsibles.filter((responsible) => responsible.id !== responsibleId);
  return memory.responsibles.length !== initialLength;
}

export async function listCategories(): Promise<Category[]> {
  return hasMongo()
    ? plain<Category[]>(CategoryModel.find().sort({ name: 1 }).lean().exec())
    : [...memory.categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const category: Category = {
    id: `cat_${randomUUID()}`,
    name: input.name.trim(),
    context: input.context,
    color: input.color,
    icon: input.icon,
    active: Boolean(input.active),
  };

  if (hasMongo()) await CategoryModel.create(category);
  else memory.categories.push(category);

  return category;
}

export async function updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<Category | null> {
  const categories = await listCategories();
  const existing = categories.find((category) => category.id === categoryId);
  if (!existing) return null;

  const updated: Category = {
    ...existing,
    ...input,
    name: input.name?.trim() ?? existing.name,
    active: input.active === undefined ? existing.active : Boolean(input.active),
  };

  if (hasMongo()) await CategoryModel.updateOne({ id: categoryId }, updated);
  else {
    const index = memory.categories.findIndex((category) => category.id === categoryId);
    if (index >= 0) memory.categories[index] = updated;
  }

  return updated;
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  if (hasMongo()) {
    const result = await CategoryModel.deleteOne({ id: categoryId });
    return result.deletedCount > 0;
  }

  const initialLength = memory.categories.length;
  memory.categories = memory.categories.filter((category) => category.id !== categoryId);
  return memory.categories.length !== initialLength;
}

export async function resetAllData() {
  if (hasMongo()) {
    await Promise.all([
      CardModel.deleteMany({}),
      ResponsibleModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      TransactionModel.deleteMany({}),
      StoreLotModel.deleteMany({}),
    ]);
  }

  memory.cards = [];
  memory.categories = [];
  memory.responsibles = [];
  memory.transactions = [];
  memory.storeLots = [];

  return { ok: true };
}

export async function listTransactions(): Promise<Transaction[]> {
  return hasMongo()
    ? plain<Transaction[]>(TransactionModel.find().sort({ purchaseDate: -1 }).lean().exec())
    : memory.transactions;
}

export async function listStoreLots(): Promise<StoreLot[]> {
  const lots: StoreLot[] = hasMongo()
    ? await plain<StoreLot[]>(StoreLotModel.find().sort({ createdAt: -1 }).lean().exec())
    : memory.storeLots;

  return lots
    .map((lot) => ({ ...lot, sales: lot.sales ?? [] }))
    .sort((a, b) => (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31"));
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const cards = await listCards();
  const card = cards.find((item) => item.id === input.cardId);
  const invoiceDueDate = input.invoiceDueDate ?? calculateInvoiceDueDate(input.purchaseDate, card?.dueDay);
  const transaction = buildTransaction({ ...input, invoiceDueDate });

  if (hasMongo()) {
    await TransactionModel.create(transaction);
  } else {
    memory.transactions.unshift(transaction);
  }

  return transaction;
}

function calculateInvoiceDueDate(purchaseDate: string, dueDay = 1) {
  const purchase = new Date(`${purchaseDate}T00:00:00`);
  const safeDueDay = Math.min(Math.max(Number(dueDay), 1), 31);
  const due = new Date(
    purchase.getFullYear(),
    purchase.getMonth(),
    Math.min(safeDueDay, new Date(purchase.getFullYear(), purchase.getMonth() + 1, 0).getDate()),
  );

  if (due < purchase) {
    due.setMonth(due.getMonth() + 1);
    due.setDate(Math.min(safeDueDay, new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate()));
  }

  return due.toISOString().slice(0, 10);
}

export async function createPayment(transactionId: string, input: AddPaymentInput): Promise<Transaction | null> {
  const existing = (await listTransactions()).find((transaction) => transaction.id === transactionId);
  if (!existing) return null;

  const updated = addPayment(existing, input);

  if (hasMongo()) {
    await TransactionModel.updateOne({ id: transactionId }, updated);
  } else {
    const index = memory.transactions.findIndex((transaction) => transaction.id === transactionId);
    if (index >= 0) memory.transactions[index] = updated;
  }

  return updated;
}

export async function checkInvoice(cardId: string, invoiceDueDate: string, bankTotal: number): Promise<InvoiceCheck> {
  const invoiceTransactions = (await listTransactions()).filter(
    (transaction) => transaction.cardId === cardId && transaction.invoiceDueDate === invoiceDueDate,
  );
  const systemTotal = invoiceTransactions.reduce((sum, transaction) => {
    const installment = transaction.installments.find((item) => item.dueDate === invoiceDueDate);
    return sum + (installment?.amount ?? 0);
  }, 0);

  return {
    cardId,
    invoiceDueDate,
    bankTotal,
    systemTotal: Math.round(systemTotal * 100) / 100,
    difference: Math.round((bankTotal - systemTotal) * 100) / 100,
    transactions: invoiceTransactions,
  };
}

export async function getBillingSummary(responsibleId: string, month: string): Promise<BillingSummary | null> {
  const [allCards, allResponsibles, allTransactions] = await Promise.all([
    listCards(),
    listResponsibles(),
    listTransactions(),
  ]);

  if (!allResponsibles.some((responsible) => responsible.id === responsibleId)) return null;

  const selected = allTransactions.filter((transaction) => transaction.responsibleId === responsibleId);
  const byCard = allCards
    .map((card) => {
      const cardTransactions = selected.filter((transaction) => transaction.cardId === card.id);
      const installmentsTotal = cardTransactions.reduce(
        (sum, transaction) => sum + monthInstallmentsTotal(transaction, month),
        0,
      );
      const paidTotal = cardTransactions.reduce((sum, transaction) => sum + monthPaidTotal(transaction, month), 0);
      const remainingTotal = cardTransactions.reduce((sum, transaction) => sum + transaction.remainingBalance, 0);

      return {
        cardId: card.id,
        cardName: cardName(allCards, card.id),
        installmentsTotal: Math.round(installmentsTotal * 100) / 100,
        paidTotal: Math.round(paidTotal * 100) / 100,
        remainingTotal: Math.round(remainingTotal * 100) / 100,
        transactions: cardTransactions,
      };
    })
    .filter((item) => item.transactions.length > 0);

  const summaryWithoutMessage = {
    responsibleId,
    responsibleName: responsibleName(allResponsibles, responsibleId),
    month,
    byCard,
    monthInstallmentsTotal: Math.round(byCard.reduce((sum, card) => sum + card.installmentsTotal, 0) * 100) / 100,
    totalDebt: Math.round(selected.reduce((sum, transaction) => sum + transaction.totalDebt, 0) * 100) / 100,
    totalPaid: Math.round(selected.reduce((sum, transaction) => sum + transaction.totalPaid, 0) * 100) / 100,
    remainingBalance:
      Math.round(selected.reduce((sum, transaction) => sum + transaction.remainingBalance, 0) * 100) / 100,
  };

  return {
    ...summaryWithoutMessage,
    message: buildBillingMessage(summaryWithoutMessage),
  };
}

export async function createStoreLot(
  input: Pick<StoreLot, "name" | "investedAmount"> & Partial<Pick<StoreLot, "cardId" | "dueDate">>,
): Promise<StoreLot> {
  const investedAmount = Number(input.investedAmount);
  const lot: StoreLot = {
    id: `lot_${randomUUID()}`,
    name: input.name.trim(),
    cardId: input.cardId || undefined,
    dueDate: input.dueDate || undefined,
    investedAmount,
    recoveredAmount: 0,
    remainingToRecover: investedAmount,
    revenueAmount: 0,
    costAmount: investedAmount,
    profitAmount: -investedAmount,
    recovered: false,
    sales: [],
  };

  if (hasMongo()) {
    await StoreLotModel.create(lot);
  } else {
    memory.storeLots.unshift(lot);
  }

  return lot;
}

export async function registerStoreSale(
  lotId: string,
  input: { amount: number; description: string; soldAt: string; cardId: string },
): Promise<StoreLot | null> {
  const lots = await listStoreLots();
  const lot = lots.find((item) => item.id === lotId);
  if (!lot) return null;

  const sale = {
    id: `sale_${randomUUID()}`,
    description: input.description.trim(),
    amount: Math.round(Number(input.amount) * 100) / 100,
    soldAt: input.soldAt,
    cardId: input.cardId,
  };
  const revenueAmount = Math.round((lot.revenueAmount + sale.amount) * 100) / 100;
  const recoveredAmount = Math.round(Math.min(lot.investedAmount, lot.recoveredAmount + sale.amount) * 100) / 100;
  const updated: StoreLot = {
    ...lot,
    revenueAmount,
    recoveredAmount,
    remainingToRecover: Math.round(Math.max(lot.investedAmount - recoveredAmount, 0) * 100) / 100,
    profitAmount: Math.round((revenueAmount - lot.costAmount) * 100) / 100,
    recovered: recoveredAmount >= lot.investedAmount,
    sales: [...(lot.sales ?? []), sale],
  };

  if (hasMongo()) {
    await StoreLotModel.updateOne({ id: lotId }, updated);
  } else {
    const index = memory.storeLots.findIndex((item) => item.id === lotId);
    if (index >= 0) memory.storeLots[index] = updated;
  }

  return updated;
}

export async function getDashboard(scope = "all"): Promise<DashboardData> {
  const [allTransactions, allCategories, allStoreLots, allResponsibles] = await Promise.all([
    listTransactions(),
    listCategories(),
    listStoreLots(),
    listResponsibles(),
  ]);
  const transactions = allTransactions.filter((transaction) => {
    const category = allCategories.find((item) => item.id === transaction.categoryId);
    const responsible = allResponsibles.find((item) => item.id === transaction.responsibleId);
    const isStore = responsible?.type === "store" || category?.context === "store";

    if (scope === "store") return isStore;
    if (scope === "personal") return !isStore;
    return true;
  });
  const storeLots = scope === "personal" ? [] : allStoreLots;
  const nowMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = transactions
    .filter((transaction) => transaction.purchaseDate.slice(0, 7) === nowMonth)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalRemaining = transactions.reduce((sum, transaction) => sum + transaction.remainingBalance, 0);
  const totalRevenue = storeLots.reduce((sum, lot) => sum + lot.revenueAmount, 0);
  const balanceEvolution = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
    const monthOutflow = transactions
      .filter((transaction) => transaction.purchaseDate.slice(0, 7) <= month)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      month: label.charAt(0).toUpperCase() + label.slice(1),
      balance: Math.round((totalRevenue - monthOutflow) * 100) / 100,
    };
  });

  return {
    summary: {
      currentBalance: Math.round((totalRevenue - totalRemaining) * 100) / 100,
      monthRevenue: Math.round(totalRevenue * 100) / 100,
      monthExpenses: Math.round(monthExpenses * 100) / 100,
    },
    balanceEvolution,
    recentTransactions: transactions.slice(0, 5).map((transaction) => {
      const category = allCategories.find((item) => item.id === transaction.categoryId);

      return {
        id: transaction.id,
        name: transaction.description,
        date: transaction.purchaseDate,
        amount: -transaction.amount,
        category: category?.name ?? "Sem categoria",
        categoryIcon: category?.icon ?? "receipt",
      };
    }),
  };
}
