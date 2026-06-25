"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  apiBaseUrl,
  type Category,
  type CreditCard,
  type Responsible,
  type StoreLot,
  type Transaction,
} from "../_lib/api";
import { useToast } from "./toast";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

const inputClass =
  "h-12 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-card)] px-3 text-sm text-[var(--on-surface)] outline-none transition placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:ring-4 focus:ring-purple-100";

const buttonClass =
  "inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-60";

function SubmitButton({
  children,
  disabled,
  pendingLabel = "Processando...",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={buttonClass} disabled={disabled || pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}

async function post(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Falha ao salvar." }));
    throw new Error(payload.error ?? "Falha ao salvar.");
  }

  return response.json();
}

export function TransactionForm({
  cards,
  responsibles,
  categories,
}: {
  cards: CreditCard[];
  responsibles: Responsible[];
  categories: Category[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState("");
  const sortedCards = useMemo(() => [...cards].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")), [cards]);
  const sortedResponsibles = useMemo(
    () => [...responsibles].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [responsibles],
  );
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [categories],
  );
  const defaultCardId = sortedCards[0]?.id ?? "";
  const defaultResponsibleId = sortedResponsibles[0]?.id ?? "";
  const defaultCategoryId = sortedCategories[0]?.id ?? "";
  const formReady = sortedCards.length > 0 && sortedResponsibles.length > 0 && sortedCategories.length > 0;

  async function submit(formData: FormData) {
    setError("");
    const toastId = toast.show("Salvando lançamento...", "loading");
    try {
      await post("/api/transactions", Object.fromEntries(formData));
      toast.update(toastId, "Lançamento salvo com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  return (
    <form action={submit} className="grid gap-4">
      <div className="rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 text-center">
        <label className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--on-surface-variant)]" htmlFor="amount">
          Valor
        </label>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="text-2xl font-bold text-[var(--primary)]">R$</span>
          <input
            className="numeric-data w-40 bg-transparent text-center text-5xl font-bold text-[var(--on-surface)] outline-none"
            id="amount"
            min="0.01"
            name="amount"
            placeholder="0,00"
            required
            step="0.01"
            type="number"
          />
        </div>
      </div>

      <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
        Descrição
        <input className={inputClass} name="description" placeholder="O que foi comprado?" required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Cartão
          <select className={inputClass} defaultValue={defaultCardId} name="cardId" required>
            {sortedCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Responsável
          <select className={inputClass} defaultValue={defaultResponsibleId} name="responsibleId" required>
            {sortedResponsibles.map((responsible) => (
              <option key={responsible.id} value={responsible.id}>
                {responsible.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Categoria
          <select className={inputClass} defaultValue={defaultCategoryId} name="categoryId" required>
            {sortedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Parcelas
          <input className={inputClass} defaultValue="1" min="1" name="installmentsCount" required type="number" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Data da compra
          <input className={inputClass} defaultValue={today()} name="purchaseDate" required type="date" />
        </label>
      </div>
      {!formReady ? (
        <p className="rounded-2xl bg-[var(--surface-container)] p-3 text-sm text-[var(--on-surface-variant)]">
          Cadastre ao menos um cartão, um responsável e uma categoria em Configurações.
        </p>
      ) : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <SubmitButton disabled={!formReady} pendingLabel="Salvando lançamento...">
        Salvar lançamento
      </SubmitButton>
    </form>
  );
}

export function PaymentForm({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();
  const toast = useToast();
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => a.description.localeCompare(b.description, "pt-BR")),
    [transactions],
  );
  const [transactionId, setTransactionId] = useState(sortedTransactions[0]?.id ?? "");
  const [error, setError] = useState("");
  const selected = useMemo(
    () => sortedTransactions.find((transaction) => transaction.id === transactionId),
    [transactionId, sortedTransactions],
  );

  async function submit(formData: FormData) {
    setError("");
    const toastId = toast.show("Registrando pagamento...", "loading");
    try {
      await post(`/api/transactions/${transactionId}/payments`, Object.fromEntries(formData));
      toast.update(toastId, "Pagamento registrado com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar pagamento.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  return (
    <form action={submit} className="grid gap-3">
      <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
        Compra
        <select className={inputClass} onChange={(event) => setTransactionId(event.target.value)} value={transactionId}>
          {sortedTransactions.map((transaction) => (
            <option key={transaction.id} value={transaction.id}>
              {transaction.description}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Valor pago
          <input className={inputClass} min="0.01" name="amount" placeholder="0,00" required step="0.01" type="number" />
        </label>
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Data do pagamento
          <input className={inputClass} defaultValue={today()} name="paidAt" required type="date" />
        </label>
      </div>
      <input className={inputClass} name="note" placeholder="Observação" />
      {selected ? <p className="text-sm text-gray-500">Saldo atual: R$ {selected.remainingBalance.toFixed(2)}</p> : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {sortedTransactions.length === 0 ? (
        <p className="rounded-2xl bg-[var(--surface-container)] p-3 text-sm text-[var(--on-surface-variant)]">
          Nenhuma transação cadastrada para receber pagamento.
        </p>
      ) : null}
      <SubmitButton disabled={sortedTransactions.length === 0} pendingLabel="Registrando pagamento...">
        Registrar pagamento
      </SubmitButton>
    </form>
  );
}

export function InvoiceCheckForm({ cards }: { cards: CreditCard[] }) {
  const toast = useToast();
  const [result, setResult] = useState<{ systemTotal: number; difference: number } | null>(null);
  const [error, setError] = useState("");
  const sortedCards = useMemo(() => [...cards].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")), [cards]);

  async function submit(formData: FormData) {
    setError("");
    const toastId = toast.show("Conferindo fatura...", "loading");
    try {
      const payload = await post("/api/invoices/check", Object.fromEntries(formData));
      setResult(payload);
      toast.update(toastId, "Fatura conferida com sucesso.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao conferir fatura.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  return (
    <form action={submit} className="grid gap-3">
      <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
        Cartão da fatura
        <select className={inputClass} name="cardId" required>
          {sortedCards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Vencimento
          <input className={inputClass} defaultValue={today()} name="invoiceDueDate" required type="date" />
        </label>
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Total do banco
          <input className={inputClass} min="0" name="bankTotal" placeholder="0,00" required step="0.01" type="number" />
        </label>
      </div>
      {result ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          Sistema: R$ {result.systemTotal.toFixed(2)} | Diferença: R$ {result.difference.toFixed(2)}
        </div>
      ) : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {sortedCards.length === 0 ? (
        <p className="rounded-2xl bg-[var(--surface-container)] p-3 text-sm text-[var(--on-surface-variant)]">
          Cadastre um cartão antes de conferir faturas.
        </p>
      ) : null}
      <SubmitButton disabled={sortedCards.length === 0} pendingLabel="Conferindo fatura...">
        Conferir fatura
      </SubmitButton>
    </form>
  );
}

export function StoreLotForms({ lots, cards }: { lots: StoreLot[]; cards: CreditCard[] }) {
  const router = useRouter();
  const toast = useToast();
  const sortedLots = useMemo(
    () => [...lots].sort((a, b) => (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31")),
    [lots],
  );
  const sortedCards = useMemo(() => [...cards].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")), [cards]);
  const [lotId, setLotId] = useState(sortedLots[0]?.id ?? "");
  const [error, setError] = useState("");
  const defaultCardId = sortedCards[0]?.id ?? "";

  async function createLot(formData: FormData) {
    setError("");
    const toastId = toast.show("Criando lote...", "loading");
    try {
      await post("/api/store/lots", Object.fromEntries(formData));
      toast.update(toastId, "Lote criado com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao criar lote.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  async function registerSale(formData: FormData) {
    setError("");
    const toastId = toast.show("Registrando venda...", "loading");
    try {
      await post(`/api/store/lots/${lotId}/sales`, Object.fromEntries(formData));
      toast.update(toastId, "Venda registrada com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao registrar venda.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  return (
    <div className="grid gap-5">
      <form action={createLot} className="grid gap-3">
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Nome do lote
          <input className={inputClass} name="name" placeholder="Ex.: Lote acessórios junho" required />
        </label>
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Valor investido
          <input className={inputClass} min="0.01" name="investedAmount" placeholder="0,00" required step="0.01" type="number" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
            Banco/cartão do lote
            <select className={inputClass} defaultValue={defaultCardId} name="cardId">
              <option value="">Sem cartão vinculado</option>
              {sortedCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
            Vencimento do lote
            <input className={inputClass} name="dueDate" type="date" />
          </label>
        </div>
        <SubmitButton pendingLabel="Criando lote...">
          Criar lote
        </SubmitButton>
      </form>

      <form action={registerSale} className="grid gap-3 border-t border-[var(--outline-variant)] pt-5">
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Lote
          <select className={inputClass} onChange={(event) => setLotId(event.target.value)} value={lotId}>
            {sortedLots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Item vendido
          <input className={inputClass} name="description" placeholder="Ex.: Capinha iPhone" required />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
            Valor da venda
            <input className={inputClass} min="0.01" name="amount" placeholder="0,00" required step="0.01" type="number" />
          </label>
          <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
            Data da venda
            <input className={inputClass} defaultValue={today()} name="soldAt" required type="date" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold tracking-[0.08em] text-[var(--on-surface-variant)]">
          Banco/cartão da venda
          <select className={inputClass} defaultValue={defaultCardId} name="cardId" required>
            {sortedCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {sortedCards.length === 0 ? (
          <p className="rounded-2xl bg-[var(--surface-container)] p-3 text-sm text-[var(--on-surface-variant)]">
            Cadastre um cartão antes de registrar vendas da loja.
          </p>
        ) : null}
        <SubmitButton disabled={sortedLots.length === 0 || sortedCards.length === 0} pendingLabel="Registrando venda...">
          Abater venda do lote
        </SubmitButton>
      </form>
    </div>
  );
}

export function BillingFilters({ responsibles }: { responsibles: Responsible[] }) {
  const sortedResponsibles = [...responsibles].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <form className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
      <select className={inputClass} name="responsibleId">
        {sortedResponsibles.map((responsible) => (
          <option key={responsible.id} value={responsible.id}>
            {responsible.name}
          </option>
        ))}
      </select>
      <input className={inputClass} defaultValue={thisMonth()} name="month" type="month" />
      <SubmitButton disabled={sortedResponsibles.length === 0} pendingLabel="Gerando resumo...">
        Gerar resumo
      </SubmitButton>
    </form>
  );
}
