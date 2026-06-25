import { AppShell } from "../_components/app-shell";
import { CardsCrud, CategoriesCrud, ResponsiblesCrud } from "../_components/settings-crud";
import { Card, PageHeader } from "../_components/ui";
import { getCards, getCategories, getResponsibles } from "../_lib/api";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [cards, categories, responsibles] = await Promise.all([getCards(), getCategories(), getResponsibles()]);

  return (
    <AppShell>
      <PageHeader
        description="Cadastros-base usados nos lançamentos, relatórios, faturas e cobranças."
        title="Configurações"
      />

      <div className="grid gap-6">
        <Card>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[var(--on-surface)]">Cartões</h2>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              Cadastre cartões, dia de vencimento, fechamento e cor de identificação.
            </p>
          </div>
          <CardsCrud cards={cards} />
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[var(--on-surface)]">Categorias</h2>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              Organize gastos pessoais, da loja ou de ambos os contextos.
            </p>
          </div>
          <CategoriesCrud categories={categories} />
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[var(--on-surface)]">Responsáveis</h2>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              Controle quem usa os cartões e quem deve receber cobrança.
            </p>
          </div>
          <ResponsiblesCrud responsibles={responsibles} />
        </Card>
      </div>
    </AppShell>
  );
}
