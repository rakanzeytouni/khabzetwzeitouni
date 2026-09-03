// scripts/seedUsers.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

async function seedUsers() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    console.log("🔍 Checking MONGODB_URI...");
    
    if (!MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined in .env.local file");
    }
    
    if (MONGODB_URI.includes("your-connection-string")) {
      throw new Error("❌ Please replace 'your-connection-string' with your actual MongoDB URI in .env.local");
    }
    
    console.log("✅ MONGODB_URI found, connecting...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");

    // حذف المستخدمين الحاليين
    await mongoose.connection.db.collection("users").deleteMany({});
    console.log("🗑️ Cleared existing users");

    // إنشاء admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    await mongoose.connection.db.collection("users").insertOne({
      username: "admin",
      password: adminPassword,
      role: "admin",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    // إنشاء cashier
    const cashierPassword = await bcrypt.hash("cashier123", 10);
    await mongoose.connection.db.collection("users").insertOne({
      username: "cashier",
      password: cashierPassword,
      role: "cashier",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Cashier user created: cashier / cashier123");

    console.log("\n🎉 Done! You can now login with these credentials.");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding users:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error("\n💡 Hint: Check your MONGODB_URI in .env.local file");
      console.error("   It should look like: mongodb+srv://username:password@cluster.mongodb.net/dbname");
    }
    process.exit(1);
  }
}

seedUsers();