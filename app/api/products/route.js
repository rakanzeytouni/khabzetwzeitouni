import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();
    const products = await Product.find({ active: true })
      .select("nameEn nameAr price cost montageCost category image")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(products, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const product = await Product.create(body);
    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/products:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error("Error in PUT /api/products:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!product) {
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({ message: "Product deleted successfully", product });
  } catch (error) {
    console.error("Error in DELETE /api/products:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}