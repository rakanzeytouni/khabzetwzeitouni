import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function GET() {
  try {
    await connectDB();
    const total = await Customer.countDocuments();
    const customers = await Customer.find().sort({ createdAt: -1 }).lean();
    return Response.json({ total, customers });
  } catch (error) {
    console.error("Error in GET /api/customers:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const customer = await Customer.create({
      name: name || "None",
    });

    return Response.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/customers:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
