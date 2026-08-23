import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function GET() {
	try {
		await connectDB();
		const expenses = await Expense.find().sort({ date: -1 });
		return Response.json(expenses);
	} catch (error) {
		console.error("Error in GET /api/expenses:", error);
		return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
	}
}

export async function POST(req) {
	try {
		await connectDB();
		const expense = await Expense.create(await req.json());
		return Response.json(expense, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/expenses:", error);
		return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
	}
}
