"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const EXCHANGE_RATE = 90000;

const formatPrice = (amount: number) =>
  `${amount.toLocaleString("en-US")} L.L. ($${(amount / EXCHANGE_RATE).toFixed(2)})`;

interface MenuItem {
  _id?: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  active: boolean;
  image?: string;
}

type MenuFormData = Omit<MenuItem, "_id" | "price" | "cost" | "stock"> & {
  price: number;
  cost: number;
  stock: number ;
};

export default function UpdateMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [descriptionSource, setDescriptionSource] = useState<"en" | "ar" | null>(null);
  const skipDescriptionTranslation = useRef(false);

  const [formData, setFormData] = useState<MenuFormData>({
    nameEn: "",
    nameAr: "",
    descEn: "",
    descAr: "",
    price: 0,
    cost: 0,
    category: "General",
    stock: 0,
    active: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (skipDescriptionTranslation.current) {
      skipDescriptionTranslation.current = false;
      return;
    }

    if (!descriptionSource) return;

    const sourceText = descriptionSource === "en" ? formData.descEn : formData.descAr;
    const targetField = descriptionSource === "en" ? "descAr" : "descEn";
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      if (!sourceText.trim()) {
        skipDescriptionTranslation.current = true;
        setFormData((current) => ({ ...current, [targetField]: "" }));
        return;
      }

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sourceText, source: descriptionSource }),
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Translation failed");

        skipDescriptionTranslation.current = true;
        setFormData((current) => ({ ...current, [targetField]: data.translation }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Translation failed:", error);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [descriptionSource, formData.descEn, formData.descAr]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setMenuItems(
        (data || []).map((item: MenuItem) => ({
          ...item,
          cost: (item as MenuItem & { montageCost?: number }).cost ?? (item as MenuItem & { montageCost?: number }).montageCost ?? 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching menu items:", error);
      alert("خطأ في تحميل قائمة الطعام");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "descEn" || name === "descAr") {
      setDescriptionSource(name === "descEn" ? "en" : "ar");
    }
    const nextValue = ["price", "cost", "stock"].includes(name)
      ? value === ""
        ? 0
        : parseInt(value, 10)
      : value;
    setFormData((current) => ({ ...current, [name]: nextValue } as MenuFormData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nameEn || !formData.nameAr || !formData.price) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...formData,
        price: formData.price,
        cost: formData.cost,
        stock: formData.stock,
        ...(editingId ? { _id: editingId } : {}),
      };

      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save product");

      // Reset form
      setFormData({
        nameEn: "",
        nameAr: "",
        descEn: "",
        descAr: "",
        price: 0,
        cost: 0,
        category: "General",
        stock: 0,
        active: true,
      });
      setDescriptionSource(null);
      setEditingId(null);
      setShowForm(false);

      // Refresh list
      await fetchMenuItems();
      alert(editingId ? "تم التحديث بنجاح" : "تم الإضافة بنجاح");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("خطأ في حفظ المنتج");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setDescriptionSource(null);
    setFormData(item);
    setEditingId(item._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");

      await fetchMenuItems();
      alert("تم الحذف بنجاح");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("خطأ في حذف المنتج");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nameEn: "",
      nameAr: "",
      descEn: "",
      descAr: "",
      price: 0,
      cost: 0,
      category: "General",
      stock: 0,
      active: true,
    });
    setDescriptionSource(null);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameAr.includes(searchTerm)
  );

  if (loading && menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-3 sm:p-6 [&_input]:text-black [&_textarea]:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">تحديث القائمة</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">إدارة قائمة الطعام والمشروبات</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto text-center bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
          >
            ← العودة
          </Link>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-blue-500">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 sm:mb-6">
              {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* English Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  اسم المنتج (English)
                </label>
                <input
                  type="text"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleInputChange}
                  placeholder="Enter product name in English"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  اسم المنتج (العربية)
                </label>
                <input
                  type="text"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleInputChange}
                  placeholder="اسم المنتج بالعربية"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* English Description */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  الوصف (English)
                </label>
                <textarea
                  name="descEn"
                  value={formData.descEn}
                  onChange={handleInputChange}
                  placeholder="Product description in English"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Arabic Description */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  الوصف (العربية)
                </label>
                <textarea
                  name="descAr"
                  value={formData.descAr}
                  onChange={handleInputChange}
                  placeholder="وصف المنتج بالعربية"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  السعر (ل.ل.)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  placeholder="السعر"
                  step="1"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  تكلفة المونتاج (ل.ل.)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost || ""}
                  onChange={handleInputChange}
                  placeholder="تكلفة المنتج"
                  step="1"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  الفئة
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="الفئة"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  المخزون
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock || ""}
                  onChange={handleInputChange}
                  placeholder="المخزون"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
                  disabled={loading}
                >
                  {editingId ? "تحديث المنتج" : "إضافة المنتج"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto mb-5 sm:mb-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            + إضافة منتج جديد
          </button>
        )}

        {/* Search Bar */}
        <div className="mb-5 sm:mb-6">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right font-semibold text-gray-800">الاسم (EN)</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-800">الاسم (AR)</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-800">السعر</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-800">تكلفة المنتج</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-800">الفئة</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-800">المخزون</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-800">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-700">{item.nameEn}</td>
                      <td className="px-6 py-4 text-gray-700 text-right">{item.nameAr}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{formatPrice(item.price)}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{formatPrice(item.cost)}</td>
                      <td className="px-6 py-4 text-gray-700">{item.category}</td>
                      <td className="px-6 py-4 text-gray-700">{item.stock}</td>
                      <td className="px-6 py-4 flex gap-3 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(item._id || "")}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition text-sm"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      لا توجد منتجات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden p-3">
            {filteredItems.length > 0 ? (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.nameAr}</h3>
                        <p className="text-sm text-gray-600">{item.nameEn}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                        {item.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">السعر</p>
                        <p className="font-semibold text-gray-800">{formatPrice(item.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">تكلفة المنتج</p>
                        <p className="font-semibold text-gray-800">{formatPrice(item.cost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">المخزون</p>
                        <p className="font-semibold text-gray-800">{item.stock}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || "")}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-8 text-center text-gray-500">لا توجد منتجات</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">إجمالي المنتجات</p>
            <p className="text-3xl font-bold text-blue-500 mt-2">{menuItems.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">إجمالي المخزون</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              {menuItems.reduce((sum, item) => sum + item.stock, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">متوسط السعر (ل.ل.)</p>
            <p className="text-xl font-bold text-orange-500 mt-2">
              {formatPrice(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}