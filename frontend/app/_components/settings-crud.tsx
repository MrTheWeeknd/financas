"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, Save, Trash2 } from "lucide-react";
import { apiBaseUrl, type Category, type CreditCard, type Responsible } from "../_lib/api";
import { CategoryIcon } from "./ui";
import { useToast } from "./toast";

const inputClass =
  "h-11 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-card)] px-3 text-sm text-[var(--on-surface)] outline-none transition placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:ring-4 focus:ring-purple-100";

const compactButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

function SubmitButton({
  children,
  pendingLabel = "Salvando...",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}

async function request(path: string, init: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Não foi possível salvar." }));
    throw new Error(payload.error ?? "Não foi possível salvar.");
  }
}

function activeFromForm(formData: FormData) {
  return formData.get("active") === "on";
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--on-surface-variant)]">
      {label}
      {children}
    </label>
  );
}

function ListDetails({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-[var(--outline-variant)] bg-white/60 p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-[var(--on-surface)]">
        <span>
          {title} ({count})
        </span>
        <span className="rounded-xl bg-[var(--surface-container)] px-3 py-2 text-xs text-[var(--primary-strong)] group-open:hidden">
          Mostrar
        </span>
        <span className="hidden rounded-xl bg-[var(--surface-container)] px-3 py-2 text-xs text-[var(--primary-strong)] group-open:inline-flex">
          Guardar
        </span>
      </summary>
      <div className="mt-3 grid gap-3">{children}</div>
    </details>
  );
}

export function CardsCrud({ cards }: { cards: CreditCard[] }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState("");

  async function create(formData: FormData) {
    setError("");
    const toastId = toast.show("Salvando cartão...", "loading");
    try {
      await request("/api/cards", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      toast.update(toastId, "Cartão salvo com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar cartão.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  async function update(cardId: string, formData: FormData) {
    setError("");
    const toastId = toast.show("Atualizando cartão...", "loading");
    try {
      await request(`/api/cards/${cardId}`, {
        method: "PUT",
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      toast.update(toastId, "Cartão atualizado com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar cartão.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  async function remove(cardId: string) {
    setError("");
    const toastId = toast.show("Excluindo cartão...", "loading");
    try {
      await request(`/api/cards/${cardId}`, { method: "DELETE" });
      toast.update(toastId, "Cartão excluído com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir cartão.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  return (
    <div className="grid gap-5">
      <form action={create} className="grid gap-3 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
        <h3 className="text-sm font-semibold text-[var(--on-surface)]">Novo cartão</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label="Nome do cartão">
            <input className={inputClass} name="name" placeholder="Ex.: Nubank" required />
          </FieldLabel>
          <FieldLabel label="Cor">
            <input className={inputClass} defaultValue="#7c3aed" name="color" required type="color" />
          </FieldLabel>
          <FieldLabel label="Dia do vencimento">
            <input className={inputClass} min="1" max="31" name="dueDay" placeholder="Ex.: 2" required type="number" />
          </FieldLabel>
          <FieldLabel label="Dia do fechamento">
            <input className={inputClass} min="1" max="31" name="closingDay" placeholder="Ex.: 25" required type="number" />
          </FieldLabel>
        </div>
        <SubmitButton className={`${compactButtonClass} bg-[var(--primary)] text-white`} pendingLabel="Salvando cartão...">
          Salvar cartão
        </SubmitButton>
      </form>

      {error ? <p className="text-sm font-medium text-[var(--error)]">{error}</p> : null}

      <ListDetails count={cards.length} title="Cartões cadastrados">
        {cards.length === 0 ? <p className="text-sm text-[var(--on-surface-variant)]">Nenhum cartão cadastrado.</p> : null}
        {cards.map((card) => (
          <form
            action={(formData) => update(card.id, formData)}
            className="grid min-w-0 gap-3 rounded-2xl border border-[var(--surface-container-highest)] bg-white/70 p-3 md:grid-cols-[1fr_120px_120px_86px_auto]"
            key={card.id}
          >
            <FieldLabel label="Nome">
              <input className={inputClass} defaultValue={card.name} name="name" placeholder="Nome do cartão" required />
            </FieldLabel>
            <FieldLabel label="Vencimento">
              <input className={inputClass} defaultValue={card.dueDay} min="1" max="31" name="dueDay" placeholder="Dia" required type="number" />
            </FieldLabel>
            <FieldLabel label="Fechamento">
              <input className={inputClass} defaultValue={card.closingDay} min="1" max="31" name="closingDay" placeholder="Dia" required type="number" />
            </FieldLabel>
            <FieldLabel label="Cor">
              <input className={inputClass} defaultValue={card.color} name="color" required type="color" />
            </FieldLabel>
            <div className="flex items-end gap-2">
              <SubmitButton className={`${compactButtonClass} bg-[var(--surface-container)] text-[var(--primary-strong)]`}>
                <Save className="h-4 w-4" />
              </SubmitButton>
              <button
                className={`${compactButtonClass} bg-red-50 text-[var(--error)]`}
                onClick={() => remove(card.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </form>
        ))}
      </ListDetails>
    </div>
  );
}

export function CategoriesCrud({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState("");

  async function create(formData: FormData) {
    setError("");
    const toastId = toast.show("Salvando categoria...", "loading");
    try {
      await request("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          ...Object.fromEntries(formData),
          active: activeFromForm(formData),
        }),
      });
      toast.update(toastId, "Categoria salva com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar categoria.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  async function update(categoryId: string, formData: FormData) {
    setError("");
    const toastId = toast.show("Atualizando categoria...", "loading");
    try {
      await request(`/api/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...Object.fromEntries(formData),
          active: activeFromForm(formData),
        }),
      });
      toast.update(toastId, "Categoria atualizada com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar categoria.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  async function remove(categoryId: string) {
    setError("");
    const toastId = toast.show("Excluindo categoria...", "loading");
    try {
      await request(`/api/categories/${categoryId}`, { method: "DELETE" });
      toast.update(toastId, "Categoria excluída com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir categoria.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  return (
    <div className="grid gap-5">
      <form action={create} className="grid gap-3 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
        <h3 className="text-sm font-semibold text-[var(--on-surface)]">Nova categoria</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label="Nome da categoria">
            <input className={inputClass} name="name" placeholder="Ex.: Mercado" required />
          </FieldLabel>
          <FieldLabel label="Contexto">
            <select className={inputClass} name="context" required>
              <option value="personal">Pessoal</option>
              <option value="store">Loja</option>
              <option value="both">Ambos</option>
            </select>
          </FieldLabel>
          <FieldLabel label="Ícone">
            <select className={inputClass} name="icon" required>
              <option value="receipt">Recibo</option>
              <option value="store">Mercado/loja</option>
              <option value="fuel">Combustível</option>
              <option value="home">Casa</option>
              <option value="package">Produto</option>
            </select>
          </FieldLabel>
          <FieldLabel label="Cor">
            <input className={inputClass} defaultValue="#7c3aed" name="color" required type="color" />
          </FieldLabel>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <input defaultChecked name="active" type="checkbox" />
          Categoria ativa
        </label>
        <SubmitButton className={`${compactButtonClass} bg-[var(--primary)] text-white`} pendingLabel="Salvando categoria...">
          Salvar categoria
        </SubmitButton>
      </form>

      {error ? <p className="text-sm font-medium text-[var(--error)]">{error}</p> : null}

      <ListDetails count={categories.length} title="Categorias cadastradas">
        {categories.length === 0 ? <p className="text-sm text-[var(--on-surface-variant)]">Nenhuma categoria cadastrada.</p> : null}
        {categories.map((category) => (
          <form
            action={(formData) => update(category.id, formData)}
            className="grid min-w-0 gap-3 rounded-2xl border border-[var(--surface-container-highest)] bg-white/70 p-3 lg:grid-cols-[44px_1fr_150px_150px_86px_100px_auto]"
            key={category.id}
          >
            <span className="mt-5 flex h-10 w-10 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: category.color }}>
              <CategoryIcon icon={category.icon} />
            </span>
            <FieldLabel label="Nome">
              <input className={inputClass} defaultValue={category.name} name="name" placeholder="Nome da categoria" required />
            </FieldLabel>
            <FieldLabel label="Contexto">
              <select className={inputClass} defaultValue={category.context} name="context" required>
                <option value="personal">Pessoal</option>
                <option value="store">Loja</option>
                <option value="both">Ambos</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Ícone">
              <select className={inputClass} defaultValue={category.icon} name="icon" required>
                <option value="receipt">Recibo</option>
                <option value="store">Mercado/loja</option>
                <option value="fuel">Combustível</option>
                <option value="home">Casa</option>
                <option value="package">Produto</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Cor">
              <input className={inputClass} defaultValue={category.color} name="color" required type="color" />
            </FieldLabel>
            <label className="flex items-end gap-2 pb-3 text-sm text-[var(--on-surface-variant)]">
              <input defaultChecked={category.active} name="active" type="checkbox" />
              Ativa
            </label>
            <div className="flex items-end gap-2">
              <SubmitButton className={`${compactButtonClass} bg-[var(--surface-container)] text-[var(--primary-strong)]`}>
                <Pencil className="h-4 w-4" />
              </SubmitButton>
              <button
                className={`${compactButtonClass} bg-red-50 text-[var(--error)]`}
                onClick={() => remove(category.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </form>
        ))}
      </ListDetails>
    </div>
  );
}

export function ResponsiblesCrud({ responsibles }: { responsibles: Responsible[] }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState("");

  async function create(formData: FormData) {
    setError("");
    const toastId = toast.show("Salvando responsável...", "loading");
    try {
      await request("/api/responsibles", {
        method: "POST",
        body: JSON.stringify({
          ...Object.fromEntries(formData),
          active: activeFromForm(formData),
        }),
      });
      toast.update(toastId, "Responsável salvo com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar responsável.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  async function update(responsibleId: string, formData: FormData) {
    setError("");
    const toastId = toast.show("Atualizando responsável...", "loading");
    try {
      await request(`/api/responsibles/${responsibleId}`, {
        method: "PUT",
        body: JSON.stringify({
          ...Object.fromEntries(formData),
          active: activeFromForm(formData),
        }),
      });
      toast.update(toastId, "Responsável atualizado com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar responsável.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  async function remove(responsibleId: string) {
    setError("");
    const toastId = toast.show("Excluindo responsável...", "loading");
    try {
      await request(`/api/responsibles/${responsibleId}`, { method: "DELETE" });
      toast.update(toastId, "Responsável excluído com sucesso.", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir responsável.";
      setError(message);
      toast.update(toastId, message, "error");
    }
  }

  return (
    <div className="grid gap-5">
      <form action={create} className="grid gap-3 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
        <h3 className="text-sm font-semibold text-[var(--on-surface)]">Novo responsável</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label="Nome do responsável">
            <input className={inputClass} name="name" placeholder="Ex.: Lucas" required />
          </FieldLabel>
          <FieldLabel label="Tipo">
            <select className={inputClass} name="type" required>
              <option value="person">Pessoa</option>
              <option value="store">Loja</option>
            </select>
          </FieldLabel>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <input defaultChecked name="active" type="checkbox" />
          Responsável ativo
        </label>
        <SubmitButton className={`${compactButtonClass} bg-[var(--primary)] text-white`} pendingLabel="Salvando responsável...">
          Salvar responsável
        </SubmitButton>
      </form>

      {error ? <p className="text-sm font-medium text-[var(--error)]">{error}</p> : null}

      <ListDetails count={responsibles.length} title="Responsáveis cadastrados">
        {responsibles.length === 0 ? <p className="text-sm text-[var(--on-surface-variant)]">Nenhum responsável cadastrado.</p> : null}
        {responsibles.map((responsible) => (
          <form
            action={(formData) => update(responsible.id, formData)}
            className="grid min-w-0 gap-3 rounded-2xl border border-[var(--surface-container-highest)] bg-white/70 p-3 md:grid-cols-[1fr_150px_100px_auto]"
            key={responsible.id}
          >
            <FieldLabel label="Nome">
              <input className={inputClass} defaultValue={responsible.name} name="name" placeholder="Nome do responsável" required />
            </FieldLabel>
            <FieldLabel label="Tipo">
              <select className={inputClass} defaultValue={responsible.type} name="type" required>
                <option value="person">Pessoa</option>
                <option value="store">Loja</option>
              </select>
            </FieldLabel>
            <label className="flex items-end gap-2 pb-3 text-sm text-[var(--on-surface-variant)]">
              <input defaultChecked={responsible.active} name="active" type="checkbox" />
              Ativo
            </label>
            <div className="flex items-end gap-2">
              <SubmitButton className={`${compactButtonClass} bg-[var(--surface-container)] text-[var(--primary-strong)]`}>
                <Save className="h-4 w-4" />
              </SubmitButton>
              <button
                className={`${compactButtonClass} bg-red-50 text-[var(--error)]`}
                onClick={() => remove(responsible.id)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </form>
        ))}
      </ListDetails>
    </div>
  );
}
