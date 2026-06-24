"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, HelpCircle, Gauge, Plus, ReceiptText, Settings, Store } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/", icon: Gauge },
  { label: "Transações", href: "/transacoes", icon: ReceiptText },
  { label: "Cartões", href: "/cartoes", icon: CreditCard },
  { label: "Loja", href: "/loja", icon: Store },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

const mobileItems = [
  { ...items[0], mobileLabel: "Início" },
  { ...items[1], mobileLabel: "Transações" },
  { ...items[2], mobileLabel: "Cartões" },
  { ...items[3], mobileLabel: "Loja" },
  { ...items[5], mobileLabel: "Config." },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-24 text-[var(--on-surface)] lg:flex lg:pb-0">
      <aside className="hidden min-h-screen w-80 shrink-0 border-r border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-5 py-7 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.01em] text-[var(--primary-strong)]">Command</h1>
          <p className="label-data mt-1 uppercase text-[var(--on-surface-variant)]">Portfólio multi-entidade</p>
        </div>

        <Link
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] hover:bg-[var(--primary-strong)]"
          href="/transacoes"
        >
          <Plus className="h-4 w-4" />
          Novo lançamento
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                aria-label={item.label}
                className={`flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold tracking-[0.05em] transition ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--on-surface-variant)] hover:bg-white hover:text-[var(--on-surface)]"
                }`}
                href={item.href}
                key={item.href}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--outline-variant)] pt-5">
          <a
            className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold tracking-[0.05em] text-[var(--on-surface-variant)] hover:bg-white"
            href="mailto:suporte@command.local"
          >
            <HelpCircle className="h-5 w-5" />
            Suporte
          </a>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-7xl px-2 py-3 sm:px-5 sm:py-7 lg:px-10 lg:py-10">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-[var(--outline-variant)] bg-[var(--surface)] px-2 py-2 shadow-sm backdrop-blur lg:hidden">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              className={`flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold sm:text-[11px] ${
                active ? "bg-[var(--primary)] text-white" : "text-[var(--on-surface-variant)]"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
