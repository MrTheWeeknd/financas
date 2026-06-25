import { AppShell } from "../_components/app-shell";
import { PaymentForm, TransactionForm } from "../_components/forms";
import { Card, CategoryIcon, PageHeader } from "../_components/ui";
import { formatCurrency, formatDate } from "../_lib/api";
import { getCards, getCategories, getResponsibles, getTransactions } from "../_lib/server-data";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const [cards, categories, responsibles, transactions] = await Promise.all([
    getCards(),
    getCategories(),
    getResponsibles(),
    getTransactions(),
  ]);

  return (
    <AppShell>
      <PageHeader
        description="Registre gastos, compras parceladas e pagamentos parciais ou antecipados por responsável."
        title="Nova transação"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <h2 className="mb-4 text-xl font-bold text-[var(--on-surface)]">Lançar gasto</h2>
          <TransactionForm cards={cards} categories={categories} responsibles={responsibles} />
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-bold text-[var(--on-surface)]">Pagamento parcial ou antecipado</h2>
          <PaymentForm transactions={transactions} />
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[var(--on-surface)]">Lançamentos</h2>
          <span className="text-sm font-bold text-[var(--on-surface-variant)]">{transactions.length} itens</span>
        </div>

        <div className="grid gap-3">
          {transactions.length === 0 ? (
            <p className="rounded-2xl bg-[var(--surface-container)] p-4 text-sm text-[var(--on-surface-variant)]">
              Nenhum lançamento registrado ainda.
            </p>
          ) : null}
          {transactions.map((transaction) => {
            const card = cards.find((item) => item.id === transaction.cardId);
            const responsible = responsibles.find((item) => item.id === transaction.responsibleId);
            const category = categories.find((item) => item.id === transaction.categoryId);

            return (
              <article className="grid gap-3 rounded-2xl border border-[var(--surface-container-highest)] bg-white/70 p-4 lg:grid-cols-[44px_1fr_auto]" key={transaction.id}>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-container)] text-[var(--primary-strong)]">
                  <CategoryIcon icon={category?.icon ?? "receipt"} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--on-surface)]">{transaction.description}</h3>
                  <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                    {category?.name ?? "Sem categoria"} - {responsible?.name ?? "Responsável"} - {card?.name ?? "Cartão"}
                  </p>
                  <p className="mt-1 text-xs font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
                    Compra {formatDate(transaction.purchaseDate)} | {transaction.installmentsCount}x
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <strong className="text-base font-bold text-[var(--on-surface)]">{formatCurrency(transaction.totalDebt)}</strong>
                  <p className="mt-1 text-sm text-emerald-600">Pago {formatCurrency(transaction.totalPaid)}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">Saldo {formatCurrency(transaction.remainingBalance)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}
