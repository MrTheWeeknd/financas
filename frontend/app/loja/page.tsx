import { Store } from "lucide-react";
import { AppShell } from "../_components/app-shell";
import { StoreLotForms } from "../_components/forms";
import { Card, PageHeader } from "../_components/ui";
import { formatCurrency, formatDate } from "../_lib/api";
import { getCards, getStoreLots } from "../_lib/server-data";

export const dynamic = "force-dynamic";

function percent(value: number) {
  return `${Math.round(value)}%`;
}

export default async function StorePage() {
  const [lots, cards] = await Promise.all([getStoreLots(), getCards()]);
  const sortedLots = [...lots].sort((a, b) => (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31"));
  const totalInvested = lots.reduce((sum, lot) => sum + lot.investedAmount, 0);
  const totalRecovered = lots.reduce((sum, lot) => sum + lot.recoveredAmount, 0);
  const totalRevenue = lots.reduce((sum, lot) => sum + lot.revenueAmount, 0);
  const totalProfit = lots.reduce((sum, lot) => sum + lot.profitAmount, 0);
  const progress = totalInvested > 0 ? (totalRecovered / totalInvested) * 100 : 0;

  return (
    <AppShell>
      <PageHeader
        description="Controle investimentos por lote, abatimentos por venda, faturamento e lucro."
        eyebrow="Loja"
        title="Operações da loja"
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">Total investido ativo</p>
          <strong className="mt-5 block break-words text-4xl font-bold text-[var(--on-surface)] sm:text-5xl">{formatCurrency(totalInvested)}</strong>
          <p className="mt-4 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">{lots.length} lotes cadastrados</p>
        </Card>

        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">Total recuperado</p>
          <strong className="mt-5 block break-words text-4xl font-bold text-[var(--on-surface)] sm:text-5xl">{formatCurrency(totalRecovered)}</strong>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--surface-container-highest)]">
            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="mt-2 text-right text-sm font-bold text-[var(--on-surface-variant)]">{percent(progress)} recuperado</p>
        </Card>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[0.85fr_1.4fr]">
        <Card className="scroll-mt-24" id="novo-lote">
          <div className="mb-5 flex items-center gap-3">
            <Store className="h-6 w-6 text-[var(--primary)]" />
            <div>
              <h2 className="text-xl font-bold text-[var(--on-surface)]">Lançamentos da loja</h2>
              <p className="text-sm text-[var(--on-surface-variant)]">Crie lotes e abata vendas.</p>
            </div>
          </div>
          <StoreLotForms cards={cards} lots={sortedLots} />
        </Card>

        <section>
          <h2 className="mb-5 text-2xl font-bold text-[var(--on-surface)]">Lotes ativos</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {lots.length === 0 ? (
              <Card>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Nenhum lote cadastrado. Crie seu primeiro lote para acompanhar recuperação e lucro.
                </p>
              </Card>
            ) : null}
            {sortedLots.map((lot) => {
              const lotProgress = lot.investedAmount > 0 ? (lot.recoveredAmount / lot.investedAmount) * 100 : 0;
              const lotCard = cards.find((card) => card.id === lot.cardId);

              return (
                <details className="rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-card)] shadow-sm" key={lot.id}>
                  <summary className="cursor-pointer list-none border-b border-[var(--outline-variant)] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--on-surface)]">{lot.name}</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-lg bg-[var(--primary)] px-3 py-1 text-xs font-bold tracking-[0.1em] text-white">
                            Revenda
                          </span>
                          {lot.dueDate ? (
                            <span className="inline-flex rounded-lg bg-[var(--surface-container)] px-3 py-1 text-xs font-bold tracking-[0.06em] text-[var(--on-surface-variant)]">
                              Vence {formatDate(lot.dueDate)}
                            </span>
                          ) : null}
                          {lotCard ? (
                            <span className="inline-flex rounded-lg bg-[var(--surface-container)] px-3 py-1 text-xs font-bold tracking-[0.06em] text-[var(--on-surface-variant)]">
                              {lotCard.name}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[var(--primary-strong)]">Abrir</span>
                    </div>
                  </summary>
                  <div className="grid gap-3 p-5">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[var(--on-surface-variant)]">Custo:</span>
                      <span>{formatCurrency(lot.investedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[var(--on-surface-variant)]">Recuperado:</span>
                      <span className="text-[var(--primary-strong)]">{formatCurrency(lot.recoveredAmount)}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
                        <span>Progresso</span>
                        <span>{percent(lotProgress)}</span>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--surface-container-highest)]">
                        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(lotProgress, 100)}%` }} />
                      </div>
                    </div>
                    <p className="text-right text-sm font-bold text-[var(--on-surface-variant)]">
                      Faturamento {formatCurrency(lot.revenueAmount)} | Lucro {formatCurrency(lot.profitAmount)}
                    </p>
                    <div className="mt-2 border-t border-[var(--outline-variant)] pt-4">
                      <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
                        Itens vendidos
                      </h4>
                      <div className="mt-3 grid gap-2">
                        {(lot.sales ?? []).length === 0 ? (
                          <p className="rounded-2xl bg-[var(--surface-container)] p-3 text-sm text-[var(--on-surface-variant)]">
                            Nenhuma venda registrada neste lote.
                          </p>
                        ) : null}
                        {(lot.sales ?? []).map((sale) => {
                          const saleCard = cards.find((card) => card.id === sale.cardId);

                          return (
                            <div className="rounded-2xl bg-[var(--surface-container-low)] p-3" key={sale.id}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[var(--on-surface)]">{sale.description}</p>
                                  <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
                                    {formatDate(sale.soldAt)} | {saleCard?.name ?? "Banco/cartão"}
                                  </p>
                                </div>
                                <strong className="whitespace-nowrap text-sm text-emerald-600">{formatCurrency(sale.amount)}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </div>

      <Card className="mt-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">Faturamento total</p>
            <strong className="mt-2 block text-2xl font-bold">{formatCurrency(totalRevenue)}</strong>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">Lucro acumulado</p>
            <strong className="mt-2 block text-2xl font-bold">{formatCurrency(totalProfit)}</strong>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">A recuperar</p>
            <strong className="mt-2 block text-2xl font-bold">
              {formatCurrency(Math.max(totalInvested - totalRecovered, 0))}
            </strong>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
