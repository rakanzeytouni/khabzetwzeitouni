import { connectDB } from "@/lib/mongodb";
import Loan from "@/models/Loan";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import jwt from "jsonwebtoken";

function getUser(req: Request) {
  const token = req.headers.get("cookie")?.match(/(?:^|;\s*)auth-token=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    return jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET || "your-secret-key-change-this") as { userId: string; role: string; username: string };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = getUser(req);
    if (!user) return Response.json({ error: "غير مصرح" }, { status: 401 });
    const loans = await Loan.find().populate("saleId").sort({ createdAt: -1 });
    const visibleLoans = user.role === "admin"
      ? loans
      : loans.filter((loan: any) => {
        const cashierId = loan.cashierId?.toString() || loan.saleId?.cashierId?.toString();
        return cashierId === user.userId || !cashierId;
      });
    return Response.json(visibleLoans);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = getUser(req);
    if (!user || user.role !== "cashier") return Response.json({ error: "غير مصرح" }, { status: 403 });
    const { sale, recipientName, recipientPhone, loanType, notes } = await req.json();
    if (!sale || !recipientName?.trim() || !loanType?.trim()) {
      return Response.json({ error: "اسم المستفيد ونوع القرض مطلوبان" }, { status: 400 });
    }
    const pendingSale = await Sale.create({ ...sale, cashierId: user.userId, cashierName: user.username, paymentMethod: "loan", amountPaid: 0, change: 0, status: "pending" });
    const loan = await Loan.create({ saleId: pendingSale._id, cashierId: user.userId, cashierName: user.username, recipientName: recipientName.trim(), recipientPhone: recipientPhone?.trim() || "", loanType: loanType.trim(), principalAmount: pendingSale.totalAmount, notes: notes?.trim() || "" });
    return Response.json({ loan, sale: pendingSale }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const user = getUser(req);
    if (!user || user.role !== "cashier") return Response.json({ error: "الكاشير فقط يستطيع تعديل حالة القرض" }, { status: 403 });
    const { loanId, action, interestAmount = 0 } = await req.json();
    const loan = await Loan.findById(loanId);
    const loanCashierId = loan?.cashierId?.toString();
    if (!loan || (loanCashierId && loanCashierId !== user.userId) || !["outstanding", "unpaid"].includes(loan.status)) return Response.json({ error: "القرض غير متاح" }, { status: 400 });
    const sale = await Sale.findById(loan.saleId);
    if (!sale) return Response.json({ error: "البيع المرتبط بالقرض غير موجود" }, { status: 404 });

    if (action === "repaid") {
      const interest = Math.max(0, Number(interestAmount) || 0);
      loan.status = "repaid";
      loan.amountPaid = loan.principalAmount + interest;
      loan.interestAmount = interest;
      loan.repaidAt = new Date();
      sale.status = "completed";
      sale.date = new Date();
      sale.amountPaid = sale.totalAmount;
      sale.paymentMethod = "cash";
      await Promise.all([
        loan.save(),
        sale.save(),
        Expense.deleteMany({
          $or: [
            { loanId: loan._id },
            { notes: { $regex: `القرض رقم ${loan._id}` } },
          ],
        }),
      ]);
    } else if (action === "unpaid" && loan.status === "outstanding") {
      loan.status = "unpaid";
      loan.unpaidAt = new Date();
      sale.status = "cancelled";
      const saleItems = sale.items as Array<{ unitCost?: number; quantity: number }>;
      let cost: number = 0;
      for (const item of saleItems) {
        cost += (item.unitCost || 0) * item.quantity;
      }
      if (cost > 0) await Expense.create({ loanId: loan._id, title: `كلفة بضاعة غير مدفوعة - ${loan.recipientName}`, category: "بيع بالدين غير مدفوع", amount: cost, notes: `القرض رقم ${loan._id}، البيع رقم ${sale.saleId}` });
      await Promise.all([loan.save(), sale.save()]);
    } else {
      return Response.json({ error: "الإجراء غير صالح" }, { status: 400 });
    }
    return Response.json(loan);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}