"use client";

import { FormEvent, useEffect, useState } from "react";

interface Customer {
  _id: string;
  name?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to load customers");
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (loadError) {
      console.error("Error loading customers:", loadError);
      setError("تعذر تحميل الزبائن");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const addCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to add customer");

      setName("");
      setShowForm(false);
      await loadCustomers();
    } catch (saveError) {
      console.error("Error adding customer:", saveError);
      setError("تعذر إضافة الزبون");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">الزبائن</h1>
            <p className="mt-1 text-gray-600">كل الزبائن المحفوظين في قاعدة البيانات</p>
          </div>
          <div className="flex gap-2">
            <a href="/admin/dashboard" className="rounded-lg bg-gray-600 px-4 py-2 font-semibold text-white hover:bg-gray-700">
              لوحة التحكم
            </a>
            <button type="button" onClick={() => setShowForm(true)} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700">
              + زبون جديد
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border-r-4 border-green-500 bg-white p-5 shadow-md">
            <form onSubmit={addCustomer} className="flex flex-wrap items-end gap-3">
              <label className="min-w-60 flex-1 text-gray-700">
                اسم الزبون
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="اتركه فارغاً لإضافة None"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                />
              </label>
              <button disabled={saving} type="submit" className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                {saving ? "جاري الحفظ..." : "حفظ الزبون"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-gray-200 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-300">
                إلغاء
              </button>
            </form>
          </div>
        )}

        {error && <p className="mb-6 text-center font-semibold text-red-600">{error}</p>}
        {loading && <p className="py-10 text-center text-gray-600">جاري تحميل الزبائن...</p>}
        {!loading && !error && customers.length === 0 && (
          <p className="rounded-lg bg-white py-10 text-center text-gray-600 shadow-md">لا يوجد زبائن محفوظون بعد</p>
        )}
        {!loading && customers.length > 0 && (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="w-full min-w-125 text-right">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-gray-700">#</th>
                  <th className="px-4 py-3 text-gray-700">اسم الزبون</th>
                  <th className="px-4 py-3 text-gray-700">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{customer.name?.trim() || "None"}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(customer.createdAt).toLocaleDateString("ar-LB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}