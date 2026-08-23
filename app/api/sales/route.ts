import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";   

export async function GET(req: Request) {
  try {
    await connectDB();
    const sales = await Sale.find().sort({ date: -1 });
    return Response.json(sales);
  } catch (error) {
    console.error("Error in GET /api/sales:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const sale = await Sale.create(body);
    return Response.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/sales:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
