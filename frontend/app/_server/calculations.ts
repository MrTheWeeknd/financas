import { randomUUID } from "node:crypto";
import type {
  AddPaymentInput,
  BillingSummary,
  CreateTransactionInput,
  CreditCard,
  Installment,
  Payment,
  Responsible,
  Transaction,
} from "./types";

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

export function generateInstallments(total: number, firstDueDate: string, count: number): Installment[] {
  const safeCount = Math.max(1, Math.floor(count));
  const base = roundMoney(total / safeCount);
  const installments: Installment[] = [];
  let allocated = 0;

  for (let index = 0; index < safeCount; index += 1) {
    const isLast = index === safeCount - 1;
    const amount = isLast ? roundMoney(total - allocated) : base;
    allocated = roundMoney(allocated + amount);

    installments.push({
      number: index + 1,
      dueDate: toDateOnly(addMonths(new Date(firstDueDate), index)),
      amount,
      paidAmount: 0,
      remainingAmount: amount,
      status: "open",
    });
  }

  return installments;
}

export function recalculateTransaction(transaction: Transaction): Transaction {
  const paymentsTotal = roundMoney(transaction.payments.reduce((sum, payment) => sum + payment.amount, 0));
  let remainingPayment = paymentsTotal;

  const installments: Installment[] = transaction.installments.map((installment) => {
    const paidAmount = roundMoney(Math.min(installment.amount, Math.max(remainingPayment, 0)));
    remainingPayment = roundMoney(remainingPayment - paidAmount);
    const remainingAmount = roundMoney(installment.amount - paidAmount);

    const status: Installment["status"] =
      remainingAmount === 0 ? "paid" : paidAmount > 0 ? "partially_paid" : "open";

    return {
      ...installment,
      paidAmount,
      remainingAmount,
      status,
    };
  });

  const totalDebt = roundMoney(transaction.amount);
  const totalPaid = roundMoney(Math.min(paymentsTotal, totalDebt));
  const remainingBalance = roundMoney(Math.max(totalDebt - totalPaid, 0));

  return {
    ...transaction,
    installments,
    totalDebt,
    totalPaid,
    remainingBalance,
    status: remainingBalance === 0 ? "paid" : totalPaid > 0 ? "partially_paid" : "open",
  };
}

export function buildTransaction(input: CreateTransactionInput): Transaction {
  const invoiceDueDate = input.invoiceDueDate ?? input.purchaseDate;
  const transaction: Transaction = {
    id: `txn_${randomUUID()}`,
    cardId: input.cardId,
    responsibleId: input.responsibleId,
    amount: roundMoney(Number(input.amount)),
    description: input.description.trim(),
    categoryId: input.categoryId,
    purchaseDate: input.purchaseDate,
    invoiceDueDate,
    installmentsCount: Math.max(1, Math.floor(Number(input.installmentsCount))),
    installments: generateInstallments(Number(input.amount), invoiceDueDate, Number(input.installmentsCount)),
    payments:
      input.payments?.map((payment) => ({
        ...payment,
        id: `pay_${randomUUID()}`,
        amount: roundMoney(Number(payment.amount)),
      })) ?? [],
    totalDebt: 0,
    totalPaid: 0,
    remainingBalance: 0,
    status: "open",
  };

  return recalculateTransaction(transaction);
}

export function addPayment(transaction: Transaction, input: AddPaymentInput): Transaction {
  const payment: Payment = {
    id: `pay_${randomUUID()}`,
    amount: roundMoney(Number(input.amount)),
    paidAt: input.paidAt,
    note: input.note?.trim() || undefined,
  };

  return recalculateTransaction({
    ...transaction,
    payments: [...transaction.payments, payment],
  });
}

export function buildBillingMessage(summary: Omit<BillingSummary, "message">) {
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const lines = [
    `Resumo ${summary.month} - ${summary.responsibleName}`,
    `Parcelas do mês: ${money.format(summary.monthInstallmentsTotal)}`,
    `Já pago: ${money.format(summary.totalPaid)}`,
    `Saldo restante: ${money.format(summary.remainingBalance)}`,
    "",
    "Por cartão:",
    ...summary.byCard.map(
      (card) =>
        `${card.cardName}: parcelas ${money.format(card.installmentsTotal)}, pago ${money.format(
          card.paidTotal,
        )}, saldo ${money.format(card.remainingTotal)}`,
    ),
  ];

  return lines.join("\n");
}

export function monthInstallmentsTotal(transaction: Transaction, month: string) {
  return roundMoney(
    transaction.installments
      .filter((installment) => monthKey(installment.dueDate) === month)
      .reduce((sum, installment) => sum + installment.amount, 0),
  );
}

export function monthPaidTotal(transaction: Transaction, month: string) {
  return roundMoney(
    transaction.payments
      .filter((payment) => monthKey(payment.paidAt) === month)
      .reduce((sum, payment) => sum + payment.amount, 0),
  );
}

export function cardName(cards: CreditCard[], cardId: string) {
  return cards.find((card) => card.id === cardId)?.name ?? "Cartão";
}

export function responsibleName(responsibles: Responsible[], responsibleId: string) {
  return responsibles.find((responsible) => responsible.id === responsibleId)?.name ?? "Responsável";
}
