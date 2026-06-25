import mongoose, { Schema } from "mongoose";

const installmentSchema = new Schema(
  {
    number: Number,
    dueDate: String,
    amount: Number,
    paidAmount: Number,
    remainingAmount: Number,
    status: String,
  },
  { _id: false },
);

const paymentSchema = new Schema(
  {
    id: String,
    amount: Number,
    paidAt: String,
    note: String,
  },
  { _id: false },
);

const storeSaleSchema = new Schema(
  {
    id: String,
    description: String,
    amount: Number,
    soldAt: String,
    cardId: String,
  },
  { _id: false },
);

const cardSchema = new Schema(
  {
    id: { type: String, unique: true },
    name: String,
    dueDay: Number,
    closingDay: Number,
    color: String,
  },
  { timestamps: true },
);

const responsibleSchema = new Schema(
  {
    id: { type: String, unique: true },
    name: String,
    type: String,
    active: Boolean,
  },
  { timestamps: true },
);

const categorySchema = new Schema(
  {
    id: { type: String, unique: true },
    name: String,
    context: String,
    color: String,
    icon: String,
    active: Boolean,
  },
  { timestamps: true },
);

const transactionSchema = new Schema(
  {
    id: { type: String, unique: true },
    cardId: String,
    responsibleId: String,
    amount: Number,
    description: String,
    categoryId: String,
    purchaseDate: String,
    invoiceDueDate: String,
    installmentsCount: Number,
    installments: [installmentSchema],
    payments: [paymentSchema],
    totalDebt: Number,
    totalPaid: Number,
    remainingBalance: Number,
    status: String,
  },
  { timestamps: true },
);

const storeLotSchema = new Schema(
  {
    id: { type: String, unique: true },
    name: String,
    cardId: String,
    dueDate: String,
    investedAmount: Number,
    recoveredAmount: Number,
    remainingToRecover: Number,
    revenueAmount: Number,
    costAmount: Number,
    profitAmount: Number,
    recovered: Boolean,
    sales: [storeSaleSchema],
  },
  { timestamps: true },
);

export const CardModel = mongoose.models.Card ?? mongoose.model("Card", cardSchema);
export const ResponsibleModel =
  mongoose.models.Responsible ?? mongoose.model("Responsible", responsibleSchema);
export const CategoryModel = mongoose.models.Category ?? mongoose.model("Category", categorySchema);
export const TransactionModel =
  mongoose.models.Transaction ?? mongoose.model("Transaction", transactionSchema);
export const StoreLotModel = mongoose.models.StoreLot ?? mongoose.model("StoreLot", storeLotSchema);
