import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();
    
    // التحقق من حالة الاتصال
    const isConnected = mongoose.connection.readyState === 1;
    console.log('Connection Status:', isConnected ? 'Connected ✅' : 'Not Connected ❌');
    
    const body = await req.json();
    const product = await Product.create(body);
    
    return Response.json(product);
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}