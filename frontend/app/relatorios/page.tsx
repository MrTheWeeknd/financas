import { AppShell } from "../_components/app-shell";
import { CopyButton } from "../_components/copy-button";
import { BillingFilters, InvoiceCheckForm } from "../_components/forms";
import { Card, PageHeader } from "../_components/ui";
import { formatCurrency } from "../_lib/api";
import { getBillingSummary, getCards, getResponsibles } from "../_lib/server-data";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ responsibleId?: string; month?: string }>;
}) {
  const params = await searchParams;
  const [cards, responsibles] = await Promise.all([getCards(), getResponsibles()]);
  const selectedResponsible = params.responsibleId ?? responsibles[0]?.id ?? "";
  const selectedMonth = params.month ?? new Date().toISOString().slice(0, 7);
  const billing = await getBillingSummary(selectedResponsible, selectedMonth);

  return (
    <AppShell>
      <PageHeader
        description="Conferência de fatura e cobrança por pessoa com mensagem pronta para copiar."
        title="Relatórios"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="mb-4 text-xl font-bold text-[var(--on-surface)]">Resumo de cobrança</h2>
          <BillingFilters responsibles={responsibles} />

          {billing ? (
            <div className="mt-5 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[var(--surface-card)] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">Parcelas do mês</p>
                  <strong>{formatCurrency(billing.monthInstallmentsTotal)}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--surface-card)] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">Pago</p>
                  <strong className="text-emerald-600">{formatCurrency(billing.totalPaid)}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--surface-card)] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">Saldo</p>
                  <strong>{formatCurrency(billing.remainingBalance)}</strong>
                </div>
              </div>

              <textarea
                className="min-h-44 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-card)] p-3 text-sm text-[var(--on-surface)] outline-none"
                defaultValue={billing.message}
                readOnly
              />
              <CopyButton text={billing.message} />
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-bold text-[var(--on-surface)]">Conferência de fatura</h2>
          <InvoiceCheckForm cards={cards} />
        </Card>
      </div>
    </AppShell>
  );
}
