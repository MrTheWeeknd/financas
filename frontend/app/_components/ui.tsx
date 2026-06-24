import { Fuel, Home, Package, ReceiptText, Store, Tags } from "lucide-react";

export function PageHeader({
  title,
  eyebrow = "Controle financeiro",
  description,
}: {
  title: string;
  eyebrow?: string;
  description: string;
}) {
  return (
    <header className="mb-4 flex flex-col gap-2 border-b border-[var(--outline-variant)] pb-4 sm:mb-8 sm:gap-3 sm:pb-6 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="label-data uppercase text-[var(--primary-strong)]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold leading-9 tracking-[-0.01em] text-[var(--on-surface)] sm:mt-2 sm:text-5xl sm:font-bold sm:leading-[56px]">
          {title}
        </h1>
      </div>
      <p className="max-w-xl text-sm leading-5 text-[var(--on-surface-variant)] sm:text-base sm:leading-6">{description}</p>
    </header>
  );
}

export function Card({
  children,
  className = "",
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={`rounded-2xl border border-[var(--outline-variant)] bg-white p-4 shadow-sm sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function CategoryIcon({ icon }: { icon: string }) {
  const className = "h-5 w-5";

  if (icon === "fuel") return <Fuel className={className} />;
  if (icon === "store") return <Store className={className} />;
  if (icon === "home") return <Home className={className} />;
  if (icon === "package") return <Package className={className} />;
  if (icon === "receipt") return <ReceiptText className={className} />;

  return <Tags className={className} />;
}
