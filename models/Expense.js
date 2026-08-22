import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		amount: { type: Number, required: true, min: 0 },
		category: { type: String, default: "Other", trim: true },
		date: { type: Date, default: Date.now, index: true },
		notes: { type: String, default: "", trim: true },
	},
	{ timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
