"use client";

import { useEffect, useState } from "react";

interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  notes?: string;
  date: string;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ar-LB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await fetch("/api/expenses");
        if (!response.ok) throw new Error("Failed to load expenses");
        setExpenses(await response.json());
      } catch (loadError) {
        console.error("Error loading expenses:", loadError);
        setError("تعذر تحميل المصاريف");
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">المصاريف</h1>
            <p className="mt-1 text-gray-600">كل المصاريف المحفوظة في قاعدة البيانات</p>
          </div>
          <a href="/cashier" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            العودة إلى الكاشير
          </a>
        </div>

        <div className="mb-6 rounded-lg border-r-4 border-orange-500 bg-white p-5 shadow-md">
          <p className="text-gray-600">مجموع المصاريف</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{total.toLocaleString()} L.L.</p>
        </div>

        {loading && <p className="py-10 text-center text-gray-600">جاري تحميل المصاريف...</p>}
        {error && <p className="py-10 text-center font-semibold text-red-600">{error}</p>}
        {!loading && !error && expenses.length === 0 && (
          <p className="rounded-lg bg-white py-10 text-center text-gray-600 shadow-md">لا توجد مصاريف محفوظة بعد</p>
        )}
        {!loading && !error && expenses.length > 0 && (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md">
            <table className="w-full min-w-162.5 text-right">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-gray-700">التاريخ</th>
                  <th className="px-4 py-3 text-gray-700">الوصف</th>
                  <th className="px-4 py-3 text-gray-700">التصنيف</th>
                  <th className="px-4 py-3 text-gray-700">المبلغ</th>
                  <th className="px-4 py-3 text-gray-700">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{expense.title}</td>
                    <td className="px-4 py-3 text-gray-700">{expense.category}</td>
                    <td className="px-4 py-3 font-bold text-orange-600">{expense.amount.toLocaleString()} L.L.</td>
                    <td className="px-4 py-3 text-gray-600">{expense.notes || "-"}</td>
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
