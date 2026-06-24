import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeDollarSign,
  CalendarDays,
  CreditCard,
  ShoppingCart,
  Store,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "./_components/app-shell";
import { BalanceChart } from "./_components/balance-chart";
import { Card, CategoryIcon, PageHeader } from "./_components/ui";
import { formatCurrency, formatDate, getDashboard } from "./_lib/api";

function SummaryCard({
  icon,
  label,
  value,
  tone,
  featured,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "purple" | "green" | "neutral";
  featured?: boolean;
}) {
  const toneClasses = {
    purple: "bg-[var(--primary)] text-white shadow-purple-700/20",
    green: "bg-emerald-50 text-emerald-600",
    neutral: "bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]",
  };

  return (
    <Card className={featured ? "bg-[var(--surface-card)] lg:col-span-2" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">{label}</p>
          <strong className={`numeric-data mt-8 block break-words font-bold tracking-normal text-[var(--on-surface)] ${featured ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl"}`}>
            {formatCurrency(value)}
          </strong>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
          {icon}
        </span>
      </div>
    </Card>
  );
}

const dashboardScopes = [
  { label: "Geral", value: "all", href: "/" },
  { label: "Pessoal", value: "personal", href: "/?scope=personal" },
  { label: "Loja", value: "store", href: "/?scope=store" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ scope?: string }>;
}) {
  const params = await searchParams;
  const scope = ["personal", "store"].includes(params?.scope ?? "") ? params?.scope ?? "all" : "all";
  const dashboard = await getDashboard(scope);

  return (
    <AppShell>
      <PageHeader
        description="Última atualização hoje. Acompanhe saldo, receitas, despesas e pendências de todos os responsáveis."
        title="Visão geral"
      />

      <div className="mb-7 inline-grid max-w-full grid-cols-3 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-1 text-xs font-bold tracking-[0.08em] text-[var(--on-surface-variant)] sm:text-sm">
        {dashboardScopes.map((item) => (
          <Link
            className={`rounded-xl px-3 py-3 text-center transition sm:px-5 ${
              scope === item.value ? "bg-white text-[var(--on-surface)] shadow-sm" : "hover:text-[var(--on-surface)]"
            }`}
            href={item.href}
            key={item.value}
          >
            {item.value === "store" ? <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--secondary)]" /> : null}
            {item.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SummaryCard
          featured
          icon={<BadgeDollarSign className="h-5 w-5" />}
          label="Saldo atual"
          tone="purple"
          value={dashboard.summary.currentBalance}
        />
        <SummaryCard
          icon={<ArrowUpCircle className="h-5 w-5" />}
          label="Receitas registradas"
          tone="green"
          value={dashboard.summary.monthRevenue}
        />
        <SummaryCard
          icon={<ArrowDownCircle className="h-5 w-5" />}
          label="Faturas abertas"
          tone="neutral"
          value={dashboard.summary.monthExpenses}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <BalanceChart points={dashboard.balanceEvolution} />

        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--on-surface)]">Transações recentes</h2>
              <p className="text-sm text-[var(--on-surface-variant)]">Lançamentos do mês</p>
            </div>
            <CalendarDays className="h-5 w-5 text-[var(--primary)]" />
          </div>

          <div className="space-y-3">
            {dashboard.recentTransactions.length === 0 ? (
              <p className="rounded-2xl bg-[var(--surface-container)] p-4 text-sm text-[var(--on-surface-variant)]">
                Nenhuma transação registrada ainda.
              </p>
            ) : null}
            {dashboard.recentTransactions.map((transaction) => {
              const isPositive = transaction.amount > 0;

              return (
                <article
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl border border-[var(--surface-container-highest)] bg-white/70 p-3"
                  key={transaction.id}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-container)] text-[var(--primary-strong)]">
                    <CategoryIcon icon={transaction.categoryIcon} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[var(--on-surface)]">{transaction.name}</h3>
                    <p className="mt-1 truncate text-xs text-[var(--on-surface-variant)]">
                      {transaction.category} - {formatDate(transaction.date)}
                    </p>
                  </div>
                  <strong className={`whitespace-nowrap text-sm font-bold ${isPositive ? "text-emerald-600" : "text-[var(--on-surface)]"}`}>
                    {isPositive ? "+" : "-"} {formatCurrency(Math.abs(transaction.amount))}
                  </strong>
                </article>
              );
            })}
          </div>
        </Card>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Link className="block" href="/cartoes">
          <Card>
            <CreditCard className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="mt-4 text-base font-bold text-[var(--on-surface)]">Faturas</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">Conferência entre banco e lançamentos do sistema.</p>
          </Card>
        </Link>
        <Link className="block" href="/relatorios">
          <Card>
            <ShoppingCart className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="mt-4 text-base font-bold text-[var(--on-surface)]">Cobranças</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">Resumo por pessoa com parcelas, pagos e saldo.</p>
          </Card>
        </Link>
        <Link className="block" href="/loja">
          <Card>
            <Store className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="mt-4 text-base font-semibold text-[var(--on-surface)]">Loja</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">Investimentos, vendas e lucro por lote.</p>
          </Card>
        </Link>
      </section>
    </AppShell>
  );
}
