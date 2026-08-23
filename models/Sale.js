import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    // Sale Information
    saleId: {
      type: String,
      unique: true,
      required: true,
      auto: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    // Items sold
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        unitCost: {
          type: Number,
          default: 0,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // Pricing
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment Information
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "check", "online", "loan"],
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    change: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Customer Information
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    customerNotes: String,

    // Staff Information
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cashierName: String,

    // Status & Notes
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled", "refunded"],
      default: "completed",
    },
    notes: String,
    printCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add compound indexes for better query performance
SaleSchema.index({ date: -1, status: 1 });
SaleSchema.index({ customerPhone: 1 });
SaleSchema.index({ cashierId: 1 });

export default mongoose.models.Sales || mongoose.model("Sales", SaleSchema);
  