import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDatabase } from "./database.js";
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
} from "./repository.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3333);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
  }),
);
app.use(express.json());

function badRequest(message: string) {
  return { error: message };
}

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "controle-financeiro-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard", async (request, response) => {
  response.json(await getDashboard(String(request.query.scope ?? "all")));
});

app.post("/api/admin/reset", async (request, response) => {
  if (request.body?.confirm !== "ZERAR") {
    response.status(400).json(badRequest('Envie confirm: "ZERAR" para apagar todos os dados.'));
    return;
  }

  response.json(await resetAllData());
});

app.get("/api/cards", async (_request, response) => {
  response.json(await listCards());
});

app.post("/api/cards", async (request, response) => {
  const { name, dueDay, closingDay, color } = request.body;

  if (!name || !Number.isFinite(Number(dueDay)) || !Number.isFinite(Number(closingDay)) || !color) {
    response.status(400).json(badRequest("Informe nome, vencimento, fechamento e cor do cartão."));
    return;
  }

  response.status(201).json(
    await createCard({
      name,
      dueDay: Number(dueDay),
      closingDay: Number(closingDay),
      color,
    }),
  );
});

app.put("/api/cards/:id", async (request, response) => {
  const card = await updateCard(request.params.id, request.body);

  if (!card) {
    response.status(404).json(badRequest("Cartão não encontrado."));
    return;
  }

  response.json(card);
});

app.delete("/api/cards/:id", async (request, response) => {
  const deleted = await deleteCard(request.params.id);

  if (!deleted) {
    response.status(404).json(badRequest("Cartão não encontrado."));
    return;
  }

  response.status(204).send();
});

app.get("/api/responsibles", async (_request, response) => {
  response.json(await listResponsibles());
});

app.post("/api/responsibles", async (request, response) => {
  const { name, type, active } = request.body;

  if (!name || !["person", "store"].includes(type)) {
    response.status(400).json(badRequest("Informe nome e tipo do responsável."));
    return;
  }

  response.status(201).json(
    await createResponsible({
      name,
      type,
      active: active === undefined ? true : Boolean(active),
    }),
  );
});

app.put("/api/responsibles/:id", async (request, response) => {
  const responsible = await updateResponsible(request.params.id, request.body);

  if (!responsible) {
    response.status(404).json(badRequest("Responsável não encontrado."));
    return;
  }

  response.json(responsible);
});

app.delete("/api/responsibles/:id", async (request, response) => {
  const deleted = await deleteResponsible(request.params.id);

  if (!deleted) {
    response.status(404).json(badRequest("Responsável não encontrado."));
    return;
  }

  response.status(204).send();
});

app.get("/api/categories", async (_request, response) => {
  response.json(await listCategories());
});

app.post("/api/categories", async (request, response) => {
  const { name, context, color, icon, active } = request.body;

  if (!name || !["personal", "store", "both"].includes(context) || !color || !icon) {
    response.status(400).json(badRequest("Informe nome, contexto, cor e ícone da categoria."));
    return;
  }

  response.status(201).json(
    await createCategory({
      name,
      context,
      color,
      icon,
      active: active === undefined ? true : Boolean(active),
    }),
  );
});

app.put("/api/categories/:id", async (request, response) => {
  const category = await updateCategory(request.params.id, request.body);

  if (!category) {
    response.status(404).json(badRequest("Categoria não encontrada."));
    return;
  }

  response.json(category);
});

app.delete("/api/categories/:id", async (request, response) => {
  const deleted = await deleteCategory(request.params.id);

  if (!deleted) {
    response.status(404).json(badRequest("Categoria não encontrada."));
    return;
  }

  response.status(204).send();
});

app.get("/api/transactions", async (_request, response) => {
  response.json(await listTransactions());
});

app.post("/api/transactions", async (request, response) => {
  const { cardId, responsibleId, amount, description, categoryId, purchaseDate, invoiceDueDate, installmentsCount } = request.body;

  if (!cardId || !responsibleId || !categoryId || !description || !purchaseDate) {
    response.status(400).json(badRequest("Preencha cartão, responsável, categoria, descrição e data da compra."));
    return;
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    response.status(400).json(badRequest("Valor deve ser maior que zero."));
    return;
  }

  const transaction = await createTransaction({
    cardId,
    responsibleId,
    amount: Number(amount),
    description,
    categoryId,
    purchaseDate,
    invoiceDueDate,
    installmentsCount: Number(installmentsCount || 1),
    payments: request.body.payments,
  });

  response.status(201).json(transaction);
});

app.post("/api/transactions/:id/payments", async (request, response) => {
  const amount = Number(request.body.amount);

  if (!Number.isFinite(amount) || amount <= 0 || !request.body.paidAt) {
    response.status(400).json(badRequest("Informe valor e data do pagamento."));
    return;
  }

  const transaction = await createPayment(request.params.id, {
    amount,
    paidAt: request.body.paidAt,
    note: request.body.note,
  });

  if (!transaction) {
    response.status(404).json(badRequest("Transação não encontrada."));
    return;
  }

  response.json(transaction);
});

app.post("/api/invoices/check", async (request, response) => {
  const { cardId, invoiceDueDate, bankTotal } = request.body;

  if (!cardId || !invoiceDueDate || !Number.isFinite(Number(bankTotal))) {
    response.status(400).json(badRequest("Informe cartão, vencimento e total do banco."));
    return;
  }

  response.json(await checkInvoice(cardId, invoiceDueDate, Number(bankTotal)));
});

app.get("/api/reports/billing", async (request, response) => {
  const responsibleId = String(request.query.responsibleId ?? "");
  const month = String(request.query.month ?? new Date().toISOString().slice(0, 7));

  if (!responsibleId) {
    response.status(400).json(badRequest("Informe o responsável."));
    return;
  }

  const summary = await getBillingSummary(responsibleId, month);

  if (!summary) {
    response.status(404).json(badRequest("Responsável não encontrado."));
    return;
  }

  response.json(summary);
});

app.get("/api/store/lots", async (_request, response) => {
  response.json(await listStoreLots());
});

app.post("/api/store/lots", async (request, response) => {
  const investedAmount = Number(request.body.investedAmount);

  if (!request.body.name || !Number.isFinite(investedAmount) || investedAmount <= 0) {
    response.status(400).json(badRequest("Informe nome do lote e valor investido."));
    return;
  }

  response.status(201).json(
    await createStoreLot({
      name: request.body.name,
      investedAmount,
      cardId: request.body.cardId,
      dueDate: request.body.dueDate,
    }),
  );
});

app.post("/api/store/lots/:id/sales", async (request, response) => {
  const amount = Number(request.body.amount);

  if (!Number.isFinite(amount) || amount <= 0 || !request.body.description || !request.body.soldAt || !request.body.cardId) {
    response.status(400).json(badRequest("Informe descrição, valor, data da venda e banco/cartão."));
    return;
  }

  const lot = await registerStoreSale(request.params.id, {
    amount,
    description: request.body.description,
    soldAt: request.body.soldAt,
    cardId: request.body.cardId,
  });

  if (!lot) {
    response.status(404).json(badRequest("Lote não encontrado."));
    return;
  }

  response.json(lot);
});

app.listen(port, () => {
  console.info(`API rodando em http://localhost:${port}`);
});

void connectDatabase()
  .catch((error) => {
    console.error("Falha ao conectar no MongoDB:", error);
  });
