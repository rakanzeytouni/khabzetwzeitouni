import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema(
	{
		saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sales", required: true, unique: true },
		recipientName: { type: String, required: true, trim: true },
		recipientPhone: { type: String, default: "", trim: true },
		loanType: { type: String, required: true, trim: true },
		principalAmount: { type: Number, required: true, min: 0 },
		amountPaid: { type: Number, default: 0, min: 0 },
		interestAmount: { type: Number, default: 0, min: 0 },
		status: { type: String, enum: ["outstanding", "repaid", "unpaid"], default: "outstanding", index: true },
		notes: { type: String, default: "", trim: true },
		repaidAt: Date,
		unpaidAt: Date,
	},
	{ timestamps: true }
);

export default mongoose.models.Loan || mongoose.model("Loan", LoanSchema);
