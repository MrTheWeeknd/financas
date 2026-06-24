import { CreditCard, Scale, Users } from "lucide-react";
import { AppShell } from "../_components/app-shell";
import { BillingFilters, InvoiceCheckForm } from "../_components/forms";
import { CopyButton } from "../_components/copy-button";
import { Card, PageHeader } from "../_components/ui";
import {
  formatCurrency,
  getBillingSummary,
  getCards,
  getResponsibles,
  getTransactions,
} from "../_lib/api";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ responsibleId?: string; month?: string }>;
}) {
  const params = await searchParams;
  const [cards, transactions, responsibles] = await Promise.all([
    getCards(),
    getTransactions(),
    getResponsibles(),
  ]);
  const selectedResponsible = params.responsibleId ?? responsibles[0]?.id ?? "";
  const selectedMonth = params.month ?? new Date().toISOString().slice(0, 7);
  const billing = await getBillingSummary(selectedResponsible, selectedMonth);

  return (
    <AppShell>
      <PageHeader
        description="Concilie faturas, acompanhe vencimentos e gere cobranças por responsável."
        eyebrow="Cartões"
        title="Operações de cartões"
      />

      <div className="grid gap-7 xl:grid-cols-[1.35fr_0.9fr]">
        <section>
          <h2 className="mb-5 text-2xl font-black text-[var(--on-surface)]">Portfólios ativos</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {cards.length === 0 ? (
              <Card>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Nenhum cartão cadastrado. Adicione seus cartões em Configurações.
                </p>
              </Card>
            ) : null}
            {cards.map((card) => {
              const cardTransactions = transactions.filter((transaction) => transaction.cardId === card.id);
              const openBalance = cardTransactions.reduce((sum, transaction) => sum + transaction.remainingBalance, 0);

              return (
                <Card className="min-h-48 overflow-hidden p-0" key={card.id}>
                  <div className="flex h-full border-l-8" style={{ borderColor: card.color }}>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-2xl font-black" style={{ color: card.color }}>
                          {card.name}
                        </h3>
                        <CreditCard className="h-5 w-5 text-[#b7a8c1]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-[0.12em] text-[var(--on-surface-variant)]">
                          Vencimento: dia {card.dueDay}
                        </p>
                        <strong className="mt-2 block text-2xl font-black text-[var(--on-surface)]">
                          {formatCurrency(openBalance)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <aside className="grid gap-5">
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <Scale className="h-6 w-6 text-[var(--primary)]" />
              <div>
                <h2 className="text-xl font-black text-[var(--on-surface)]">Conciliação de fatura</h2>
                <p className="text-sm text-[var(--on-surface-variant)]">Compare banco x sistema.</p>
              </div>
            </div>
            <InvoiceCheckForm cards={cards} />
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <Users className="h-6 w-6 text-[var(--primary)]" />
              <div>
                <h2 className="text-xl font-black text-[var(--on-surface)]">Cobrança por pessoa</h2>
                <p className="text-sm text-[var(--on-surface-variant)]">Resumo pronto para enviar.</p>
              </div>
            </div>
            <BillingFilters responsibles={responsibles} />

            {billing ? (
              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between border-b border-[var(--surface-container-highest)] pb-3 text-sm">
                  <span className="text-[var(--on-surface-variant)]">Parcelas do mês</span>
                  <strong>{formatCurrency(billing.monthInstallmentsTotal)}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--surface-container-highest)] pb-3 text-sm">
                  <span className="text-[var(--on-surface-variant)]">Já pago</span>
                  <strong className="text-[var(--primary)]">{formatCurrency(billing.totalPaid)}</strong>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <strong>Total a cobrar</strong>
                  <strong>{formatCurrency(billing.remainingBalance)}</strong>
                </div>
                <CopyButton text={billing.message} />
              </div>
            ) : null}
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
