export type CreditCardName = string;

export type ResponsibleName = string;

export type CategoryContext = "personal" | "store" | "both";

export type TransactionStatus = "open" | "partially_paid" | "paid";

export type CreditCard = {
  id: string;
  name: CreditCardName;
  dueDay: number;
  closingDay: number;
  color: string;
};

export type Responsible = {
  id: string;
  name: ResponsibleName;
  type: "person" | "store";
  active: boolean;
};

export type Category = {
  id: string;
  name: string;
  context: CategoryContext;
  color: string;
  icon: string;
  active: boolean;
};

export type Payment = {
  id: string;
  amount: number;
  paidAt: string;
  note?: string;
};

export type Installment = {
  number: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: TransactionStatus;
};

export type Transaction = {
  id: string;
  cardId: string;
  responsibleId: string;
  amount: number;
  description: string;
  categoryId: string;
  purchaseDate: string;
  invoiceDueDate: string;
  installmentsCount: number;
  installments: Installment[];
  payments: Payment[];
  totalDebt: number;
  totalPaid: number;
  remainingBalance: number;
  status: TransactionStatus;
};

export type StoreLot = {
  id: string;
  name: string;
  cardId?: string;
  dueDate?: string;
  investedAmount: number;
  recoveredAmount: number;
  remainingToRecover: number;
  revenueAmount: number;
  costAmount: number;
  profitAmount: number;
  recovered: boolean;
  sales: StoreSale[];
};

export type StoreSale = {
  id: string;
  description: string;
  amount: number;
  soldAt: string;
  cardId: string;
};

export type CreateTransactionInput = {
  cardId: string;
  responsibleId: string;
  amount: number;
  description: string;
  categoryId: string;
  purchaseDate: string;
  invoiceDueDate?: string;
  installmentsCount: number;
  payments?: Omit<Payment, "id">[];
};

export type AddPaymentInput = {
  amount: number;
  paidAt: string;
  note?: string;
};

export type InvoiceCheck = {
  cardId: string;
  invoiceDueDate: string;
  bankTotal: number;
  systemTotal: number;
  difference: number;
  transactions: Transaction[];
};

export type BillingSummary = {
  responsibleId: string;
  responsibleName: string;
  month: string;
  byCard: Array<{
    cardId: string;
    cardName: string;
    installmentsTotal: number;
    paidTotal: number;
    remainingTotal: number;
    transactions: Transaction[];
  }>;
  monthInstallmentsTotal: number;
  totalDebt: number;
  totalPaid: number;
  remainingBalance: number;
  message: string;
};

export type DashboardData = {
  summary: {
    currentBalance: number;
    monthRevenue: number;
    monthExpenses: number;
  };
  balanceEvolution: Array<{ month: string; balance: number }>;
  recentTransactions: Array<{
    id: string;
    name: string;
    date: string;
    amount: number;
    category: string;
    categoryIcon: string;
  }>;
};

export type CreateCardInput = Omit<CreditCard, "id">;

export type UpdateCardInput = Partial<CreateCardInput>;

export type CreateResponsibleInput = Omit<Responsible, "id">;

export type UpdateResponsibleInput = Partial<CreateResponsibleInput>;

export type CreateCategoryInput = Omit<Category, "id">;

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
