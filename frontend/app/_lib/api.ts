export type CreditCard = {
  id: string;
  name: string;
  dueDay: number;
  closingDay: number;
  color: string;
};

export type Responsible = {
  id: string;
  name: string;
  type: "person" | "store";
  active: boolean;
};

export type Category = {
  id: string;
  name: string;
  context: "personal" | "store" | "both";
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
  status: "open" | "partially_paid" | "paid";
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
  status: "open" | "partially_paid" | "paid";
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

export type InvoiceCheck = {
  cardId: string;
  invoiceDueDate: string;
  bankTotal: number;
  systemTotal: number;
  difference: number;
  transactions: Transaction[];
};

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? "" : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function request<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      next: init?.method ? undefined : { revalidate: 5 },
    });

    if (!response.ok) return fallback;
    if (!response.headers.get("content-type")?.includes("application/json")) return fallback;

    return await response.json();
  } catch {
    return fallback;
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export async function getDashboard(scope = "all") {
  const query = new URLSearchParams({ scope });

  return request<DashboardData>(`/api/dashboard?${query.toString()}`, {
    summary: { currentBalance: 0, monthRevenue: 0, monthExpenses: 0 },
    balanceEvolution: [],
    recentTransactions: [],
  });
}

export async function getCards() {
  return request<CreditCard[]>("/api/cards", []);
}

export async function getResponsibles() {
  return request<Responsible[]>("/api/responsibles", []);
}

export async function getCategories() {
  return request<Category[]>("/api/categories", []);
}

export async function getTransactions() {
  return request<Transaction[]>("/api/transactions", []);
}

export async function getStoreLots() {
  return request<StoreLot[]>("/api/store/lots", []);
}

export async function getBillingSummary(responsibleId: string, month: string) {
  if (!responsibleId) return null;
  return request<BillingSummary | null>(
    `/api/reports/billing?responsibleId=${responsibleId}&month=${month}`,
    null,
  );
}
