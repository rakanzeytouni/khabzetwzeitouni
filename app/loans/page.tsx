"use client";

import { useEffect, useState } from "react";

type Loan = {
  _id: string;
  recipientName: string;
  recipientPhone?: string;
  loanType: string;
  principalAmount: number;
  interestAmount: number;
  status: "outstanding" | "repaid" | "unpaid";
  notes?: string;
  createdAt: string;
  saleId?: { saleId?: string };
};

const money = (value: number) => `${value.toLocaleString()} ل.ل.`;

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [interest, setInterest] = useState<Record<string, string>>({});

  const loadLoans = async () => {
    const response = await fetch("/api/loans");
    if (response.ok) setLoans(await response.json());
    setLoading(false);
  };

  useEffect(() => { loadLoans(); }, []);

  const updateLoan = async (loan: Loan, action: "repaid" | "unpaid") => {
    const message = action === "repaid" ? "تأكيد أن القرض تم تسديده؟" : "سيُلغى البيع وتُسجّل كلفة المنتجات كمصروف. متابعة؟";
    if (!window.confirm(message)) return;
    const response = await fetch("/api/loans", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loanId: loan._id, action, interestAmount: Number(interest[loan._id] || 0) }) });
    if (response.ok) loadLoans();
    else alert("تعذر تحديث القرض");
  };

  const total = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const repaid = loans.filter((loan) => loan.status === "repaid").reduce((sum, loan) => sum + loan.principalAmount, 0);
  const outstanding = loans.filter((loan) => loan.status === "outstanding").reduce((sum, loan) => sum + loan.principalAmount, 0);
  const earnedInterest = loans.reduce((sum, loan) => sum + (loan.interestAmount || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة القروض</h1>
            <p className="mt-1 text-gray-600">
              متابعة المبيعات المؤجلة والتحصيل
            </p>
          </div>
          <a
            href="/admin/dashboard"
            className="rounded bg-gray-700 px-4 py-2 font-semibold text-white"
          >
            لوحة التحكم
          </a>
        </div>
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["إجمالي القروض", total, "text-blue-600"],
            ["القروض المسددة", repaid, "text-green-600"],
            ["القروض المتبقية", outstanding, "text-orange-600"],
            ["الفائدة المحصلة", earnedInterest, "text-purple-600"],
          ].map(([label, value, color]) => (
            <div
              key={label as string}
              className="rounded-lg bg-white p-5 shadow"
            >
              <p className="text-sm font-semibold text-gray-600">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>
                {money(value as number)}
              </p>
            </div>
          ))}
        </section>
        <section className="overflow-x-auto rounded-lg bg-white shadow">
          {loading ? (
            <p className="p-8 text-center text-gray-600">جاري التحميل...</p>
          ) : loans.length === 0 ? (
            <p className="p-8 text-center text-gray-600">لا توجد قروض مسجلة</p>
          ) : (
            <table className="w-full min-w-212.5 text-right">
              <thead className="border-b bg-gray-100">
                <tr>
                  {[
                    "المستفيد",
                    "نوع القرض",
                    "المبلغ",
                    "التاريخ",
                    "الحالة",
                    "الإجراء",
                  ].map((heading) => (
                    <th key={heading} className="p-4 font-bold text-gray-700">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id} className="border-b last:border-0">
                    <td className="p-4 font-semibold text-gray-800">
                      {loan.recipientName}
                      <span className="block text-sm font-normal text-gray-500">
                        {loan.recipientPhone}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{loan.loanType}</td>
                    <td className="p-4 font-semibold text-gray-700">
                      {money(loan.principalAmount)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(loan.createdAt).toLocaleDateString("ar-LB")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${loan.status === "repaid" ? "bg-green-100 text-green-700" : loan.status === "unpaid" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {loan.status === "repaid"
                          ? "تم التسديد"
                          : loan.status === "unpaid"
                            ? "غير مدفوع"
                            : "مستحق"}
                      </span>
                    </td>
                    <td className="p-4">
                      {loan.status === "outstanding" ? (
                        <div className="flex min-w-56 gap-2">
                          <button
                            onClick={() => updateLoan(loan, "repaid")}
                            className="rounded bg-green-600 px-3 py-2 text-sm font-bold text-white"
                          >
                            تم التسديد
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={interest[loan._id] || ""}
                            onChange={(e) =>
                              setInterest({
                                ...interest,
                                [loan._id]: e.target.value,
                              })
                            }
                            placeholder="فائدة"
                            className="w-20 rounded border px-2 text-black"
                          />
                          <button
                            onClick={() => updateLoan(loan, "unpaid")}
                            className="rounded bg-red-600 px-3 py-2 text-sm font-bold text-white"
                          >
                            غير مدفوع
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">لا يوجد إجراء</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
