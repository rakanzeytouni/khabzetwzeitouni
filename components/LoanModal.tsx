"use client";

import { useState } from "react";

type LoanModalProps = { totalAmount: number; sale: Record<string, unknown>; onClose: () => void; onSaved: (result: { loan: unknown }) => void };

export default function LoanModal({ totalAmount, sale, onClose, onSaved }: LoanModalProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [loanType, setLoanType] = useState("بيع بالدين");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveLoan = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recipientName.trim()) return setError("اكتب اسم الشخص الذي أخذ القرض");
    try {
      setSaving(true);
      const response = await fetch("/api/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sale, recipientName, recipientPhone, loanType, notes }) });
      if (!response.ok) throw new Error("Failed to save loan");
      onSaved(await response.json());
    } catch { setError("حدث خطأ أثناء حفظ القرض"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
      <form onSubmit={saveLoan} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-2xl font-bold text-gray-800">تسجيل قرض</h2>
        <p className="mb-5 text-gray-600">المبلغ: {totalAmount.toLocaleString()} ل.ل. ولن يُحتسب كمبيع قبل التسديد.</p>
        <div className="space-y-3">
          <input required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="اسم الشخص الذي أخذ القرض" className="w-full rounded border border-gray-400 px-3 py-2 text-black" autoFocus />
          <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="رقم الهاتف (اختياري)" className="w-full rounded border border-gray-400 px-3 py-2 text-black" />
          <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="w-full rounded border border-gray-400 px-3 py-2 text-black"><option>بيع بالدين</option><option>سلفة للموظف</option><option>قرض نقدي</option></select>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات (اختياري)" rows={2} className="w-full rounded border border-gray-400 px-3 py-2 text-black" />
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-5 flex gap-3"><button disabled={saving} className="flex-1 rounded bg-purple-600 py-2 font-bold text-white disabled:bg-gray-400">{saving ? "جاري الحفظ..." : "حفظ القرض"}</button><button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded bg-gray-500 py-2 font-bold text-white">إلغاء</button></div>
      </form>
    </div>
  );
}