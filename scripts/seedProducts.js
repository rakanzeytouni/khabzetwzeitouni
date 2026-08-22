// scripts/seedProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// تحديد path ملف .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env.local");

console.log("📂 Loading env from:", envPath);

// تحميل متغيرات البيئة
dotenv.config({ path: envPath });

async function seedProducts() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    console.log("🔍 Checking MONGODB_URI...");

    if (!MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined in .env.local file");
    }

    if (MONGODB_URI.includes("your-connection-string")) {
      throw new Error(
        "❌ Please replace 'your-connection-string' with your actual MongoDB URI in .env.local"
      );
    }

    console.log("✅ MONGODB_URI found, connecting...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");

    // حذف المنتجات الحالية
    await mongoose.connection.db.collection("products").deleteMany({});
    console.log("🗑️ Cleared existing products");

    // البيانات النموذجية للمنتجات
    const products = [
      {
        nameEn: "Tawook",
        nameAr: "طاووق",
        descEn: "tawook, fries, coleslaw salad",
        descAr: "طاووق بطاطا سلطة كولسلو",
        price: 5.5,
        category: "Main Courses",
        stock: 50,
        active: true,
      },
      {
        nameEn: "Burger",
        nameAr: "برغر",
        descEn: "Beef, onions, tomatoes, iceberg lettuce, cocktail sauce",
        descAr: "لحمة بصل بندورة ايسبرغ كوكتيل صوص",
        price: 4.5,
        category: "Main Courses",
        stock: 60,
        active: true,
      },
      {
        nameEn: "Turkey",
        nameAr: "تركي",
        descEn: "Turkey, Emmental cheese, tomatoes, pickles, concho, white",
        descAr: "حبش جبنة ايمانتال بندورة كبيس الكونشو وايت صوص",
        price: 6.0,
        category: "Main Courses",
        stock: 40,
        active: true,
      },
      {
        nameEn: "Halloumi Pesto",
        nameAr: "حلوم بيستو",
        descEn: "Halloumi, pesto, tomatoes",
        descAr: "حلوم بيستو بندورة",
        price: 6.0,
        category: "Main Courses",
        stock: 35,
        active: true,
      },
      {
        nameEn: "Chicken Chad",
        nameAr: "تشكن تشاد",
        descEn: "Chicken, onions, bell peppers, cheddar, kashkaval cheese",
        descAr: "دجاج بصل فليفلة جبنة الشيدر و قشقوان",
        price: 7.0,
        category: "Main Courses",
        stock: 45,
        active: true,
      },
      {
        nameEn: "Chicken Grazilete",
        nameAr: "تشكن غرازيليت",
        descEn: "Chicken, mixed peppers, Parmesan & Kashkaval",
        descAr: "دجاج فليفلة ملونة جبنة برميزان و قشقوان",
        price: 7.0,
        category: "Main Courses",
        stock: 40,
        active: true,
      },
      {
        nameEn: "Nutella Toast",
        nameAr: "توست نوتيلا",
        descEn: "Nutella toast, cherry jam or sour cherry jam",
        descAr: "توست نوتيلا مربى الكرز أو مربى حامض",
        price: 2.5,
        category: "Desserts",
        stock: 100,
        active: true,
      },
      {
        nameEn: "Iced Coffee",
        nameAr: "قهوة باردة",
        descEn: "Cold brew coffee with ice",
        descAr: "قهوة باردة مع ثلج",
        price: 2.0,
        category: "Beverages",
        stock: 80,
        active: true,
      },
      {
        nameEn: "Fresh Juice",
        nameAr: "عصير طازج",
        descEn: "Fresh fruit juice",
        descAr: "عصير فاكهة طازج",
        price: 1.5,
        category: "Beverages",
        stock: 90,
        active: true,
      },
      {
        nameEn: "Caesar Salad",
        nameAr: "سلطة قيصر",
        descEn: "Fresh salad with croutons and dressing",
        descAr: "سلطة طازجة مع خبز محمص وصوص",
        price: 3.5,
        category: "Salads",
        stock: 55,
        active: true,
      },
    ];

    // إدراج البيانات
    const result = await mongoose.connection.db
      .collection("products")
      .insertMany(products);

    console.log(
      `✅ Successfully inserted ${result.insertedIds.length} products`
    );

    // عرض الإحصائيات
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    console.log(`\n📊 Product Statistics:`);
    console.log(`   Total Products: ${products.length}`);
    console.log(`   Total Stock Value: $${totalValue.toFixed(2)}`);
    console.log(`   Categories: ${new Set(products.map((p) => p.category)).size}`);

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedProducts();
