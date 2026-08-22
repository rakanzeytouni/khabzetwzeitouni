import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    // English fields
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    descEn: {
      type: String,
      default: "",
      trim: true,
    },

    // Arabic fields
    nameAr: {
      type: String,
      required: true,
      trim: true,
    },
    descAr: {
      type: String,
      default: "",
      trim: true,
    },

    // Price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Montage cost
    montageCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Category
    category: {
      type: String,
      default: "General",
      trim: true,
    },

    // Stock management
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Status
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Image URL
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);