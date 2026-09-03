import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		amount: { type: Number, required: true, min: 0 },
		amountUsd: { type: Number, default: 0, min: 0 },
		exchangeRate: { type: Number, default: 90000, min: 1 },
		category: { type: String, default: "Other", trim: true },
		date: { type: Date, default: Date.now, index: true },
		notes: { type: String, default: "", trim: true },
		loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", index: true },
	},
	{ timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
