import { connectDB } from "@/lib/mongodb";
import Loan from "@/models/Loan";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";

export async function GET() {
  try {
    await connectDB();
    const loans = await Loan.find().populate("saleId").sort({ createdAt: -1 });
    return Response.json(loans);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { sale, recipientName, recipientPhone, loanType, notes } = await req.json();
    if (!sale || !recipientName?.trim() || !loanType?.trim()) {
      return Response.json({ error: "اسم المستفيد ونوع القرض مطلوبان" }, { status: 400 });
    }
    const pendingSale = await Sale.create({ ...sale, paymentMethod: "loan", amountPaid: 0, change: 0, status: "pending" });
    const loan = await Loan.create({ saleId: pendingSale._id, recipientName: recipientName.trim(), recipientPhone: recipientPhone?.trim() || "", loanType: loanType.trim(), principalAmount: pendingSale.totalAmount, notes: notes?.trim() || "" });
    return Response.json({ loan, sale: pendingSale }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { loanId, action, interestAmount = 0 } = await req.json();
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== "outstanding") return Response.json({ error: "القرض غير متاح" }, { status: 400 });
    const sale = await Sale.findById(loan.saleId);
    if (!sale) return Response.json({ error: "البيع المرتبط بالقرض غير موجود" }, { status: 404 });

    if (action === "repaid") {
      const interest = Math.max(0, Number(interestAmount) || 0);
      loan.status = "repaid";
      loan.amountPaid = loan.principalAmount + interest;
      loan.interestAmount = interest;
      loan.repaidAt = new Date();
      sale.status = "completed";
      sale.amountPaid = sale.totalAmount;
      sale.paymentMethod = "cash";
      await Promise.all([loan.save(), sale.save()]);
    } else if (action === "unpaid") {
      loan.status = "unpaid";
      loan.unpaidAt = new Date();
      sale.status = "cancelled";
      const saleItems = sale.items as Array<{ unitCost?: number; quantity: number }>;
      let cost: number = 0;
      for (const item of saleItems) {
        cost += (item.unitCost || 0) * item.quantity;
      }
      if (cost > 0) await Expense.create({ title: `كلفة بضاعة غير مدفوعة - ${loan.recipientName}`, category: "بيع بالدين غير مدفوع", amount: cost, notes: `القرض رقم ${loan._id}، البيع رقم ${sale.saleId}` });
      await Promise.all([loan.save(), sale.save()]);
    } else {
      return Response.json({ error: "الإجراء غير صالح" }, { status: 400 });
    }
    return Response.json(loan);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}