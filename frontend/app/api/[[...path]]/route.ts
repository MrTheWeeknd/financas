import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "../../_server/database";
import {
  checkInvoice,
  createCard,
  createCategory,
  createPayment,
  createResponsible,
  createStoreLot,
  createTransaction,
  deleteCard,
  deleteCategory,
  deleteResponsible,
  getBillingSummary,
  getDashboard,
  listCards,
  listCategories,
  listResponsibles,
  listStoreLots,
  listTransactions,
  registerStoreSale,
  resetAllData,
  updateCard,
  updateCategory,
  updateResponsible,
} from "../../_server/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ path?: string[] }>;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function badRequest(message: string) {
  return json({ error: message }, 400);
}

function notFound(message: string) {
  return json({ error: message }, 404);
}

async function body(request: NextRequest) {
  return request.json().catch(() => ({}));
}

function route(path: string[] = []) {
  return path.join("/");
}

async function handler(request: NextRequest, context: { params: Params }) {
  await connectDatabase();

  const { path = [] } = await context.params;
  const currentRoute = route(path);
  const method = request.method;
  const searchParams = request.nextUrl.searchParams;

  if (method === "GET" && currentRoute === "dashboard") {
    return json(await getDashboard(searchParams.get("scope") ?? "all"));
  }

  if (method === "POST" && currentRoute === "admin/reset") {
    const payload = await body(request);
    if (payload.confirm !== "ZERAR") return badRequest('Envie confirm: "ZERAR" para apagar todos os dados.');
    return json(await resetAllData());
  }

  if (currentRoute === "cards") {
    if (method === "GET") return json(await listCards());
    if (method === "POST") {
      const payload = await body(request);
      const { name, dueDay, closingDay, color } = payload;

      if (!name || !Number.isFinite(Number(dueDay)) || !Number.isFinite(Number(closingDay)) || !color) {
        return badRequest("Informe nome, vencimento, fechamento e cor do cartão.");
      }

      return json(await createCard({ name, dueDay: Number(dueDay), closingDay: Number(closingDay), color }), 201);
    }
  }

  if (path[0] === "cards" && path[1]) {
    if (method === "PUT") {
      const card = await updateCard(path[1], await body(request));
      return card ? json(card) : notFound("Cartão não encontrado.");
    }

    if (method === "DELETE") {
      const deleted = await deleteCard(path[1]);
      return deleted ? new NextResponse(null, { status: 204 }) : notFound("Cartão não encontrado.");
    }
  }

  if (currentRoute === "responsibles") {
    if (method === "GET") return json(await listResponsibles());
    if (method === "POST") {
      const payload = await body(request);
      const { name, type, active } = payload;

      if (!name || !["person", "store"].includes(type)) {
        return badRequest("Informe nome e tipo do responsável.");
      }

      return json(await createResponsible({ name, type, active: active === undefined ? true : Boolean(active) }), 201);
    }
  }

  if (path[0] === "responsibles" && path[1]) {
    if (method === "PUT") {
      const responsible = await updateResponsible(path[1], await body(request));
      return responsible ? json(responsible) : notFound("Responsável não encontrado.");
    }

    if (method === "DELETE") {
      const deleted = await deleteResponsible(path[1]);
      return deleted ? new NextResponse(null, { status: 204 }) : notFound("Responsável não encontrado.");
    }
  }

  if (currentRoute === "categories") {
    if (method === "GET") return json(await listCategories());
    if (method === "POST") {
      const payload = await body(request);
      const { name, context: categoryContext, color, icon, active } = payload;

      if (!name || !["personal", "store", "both"].includes(categoryContext) || !color || !icon) {
        return badRequest("Informe nome, contexto, cor e ícone da categoria.");
      }

      return json(
        await createCategory({
          name,
          context: categoryContext,
          color,
          icon,
          active: active === undefined ? true : Boolean(active),
        }),
        201,
      );
    }
  }

  if (path[0] === "categories" && path[1]) {
    if (method === "PUT") {
      const category = await updateCategory(path[1], await body(request));
      return category ? json(category) : notFound("Categoria não encontrada.");
    }

    if (method === "DELETE") {
      const deleted = await deleteCategory(path[1]);
      return deleted ? new NextResponse(null, { status: 204 }) : notFound("Categoria não encontrada.");
    }
  }

  if (currentRoute === "transactions") {
    if (method === "GET") return json(await listTransactions());
    if (method === "POST") {
      const payload = await body(request);
      const { cardId, responsibleId, amount, description, categoryId, purchaseDate, invoiceDueDate, installmentsCount } = payload;

      if (!cardId || !responsibleId || !categoryId || !description || !purchaseDate) {
        return badRequest("Preencha cartão, responsável, categoria, descrição e data da compra.");
      }

      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return badRequest("Valor deve ser maior que zero.");
      }

      return json(
        await createTransaction({
          cardId,
          responsibleId,
          amount: Number(amount),
          description,
          categoryId,
          purchaseDate,
          invoiceDueDate,
          installmentsCount: Number(installmentsCount || 1),
          payments: payload.payments,
        }),
        201,
      );
    }
  }

  if (path[0] === "transactions" && path[1] && path[2] === "payments" && method === "POST") {
    const payload = await body(request);
    const amount = Number(payload.amount);

    if (!Number.isFinite(amount) || amount <= 0 || !payload.paidAt) {
      return badRequest("Informe valor e data do pagamento.");
    }

    const transaction = await createPayment(path[1], {
      amount,
      paidAt: payload.paidAt,
      note: payload.note,
    });

    return transaction ? json(transaction) : notFound("Transação não encontrada.");
  }

  if (currentRoute === "invoices/check" && method === "POST") {
    const payload = await body(request);
    const { cardId, invoiceDueDate, bankTotal } = payload;

    if (!cardId || !invoiceDueDate || !Number.isFinite(Number(bankTotal))) {
      return badRequest("Informe cartão, vencimento e total do banco.");
    }

    return json(await checkInvoice(cardId, invoiceDueDate, Number(bankTotal)));
  }

  if (currentRoute === "reports/billing" && method === "GET") {
    const responsibleId = searchParams.get("responsibleId") ?? "";
    const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

    if (!responsibleId) return badRequest("Informe o responsável.");

    const summary = await getBillingSummary(responsibleId, month);
    return summary ? json(summary) : notFound("Responsável não encontrado.");
  }

  if (currentRoute === "store/lots") {
    if (method === "GET") return json(await listStoreLots());
    if (method === "POST") {
      const payload = await body(request);
      const investedAmount = Number(payload.investedAmount);

      if (!payload.name || !Number.isFinite(investedAmount) || investedAmount <= 0) {
        return badRequest("Informe nome do lote e valor investido.");
      }

      return json(
        await createStoreLot({
          name: payload.name,
          investedAmount,
          cardId: payload.cardId,
          dueDate: payload.dueDate,
        }),
        201,
      );
    }
  }

  if (path[0] === "store" && path[1] === "lots" && path[2] && path[3] === "sales" && method === "POST") {
    const payload = await body(request);
    const amount = Number(payload.amount);

    if (!Number.isFinite(amount) || amount <= 0 || !payload.description || !payload.soldAt || !payload.cardId) {
      return badRequest("Informe descrição, valor, data da venda e banco/cartão.");
    }

    const lot = await registerStoreSale(path[2], {
      amount,
      description: payload.description,
      soldAt: payload.soldAt,
      cardId: payload.cardId,
    });

    return lot ? json(lot) : notFound("Lote não encontrado.");
  }

  return json({ error: "Rota não encontrada." }, 404);
}

export async function GET(request: NextRequest, context: { params: Params }) {
  return handler(request, context);
}

export async function POST(request: NextRequest, context: { params: Params }) {
  return handler(request, context);
}

export async function PUT(request: NextRequest, context: { params: Params }) {
  return handler(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  return handler(request, context);
}
