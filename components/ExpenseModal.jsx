"use client";

import { useState } from "react";

const EXCHANGE_RATE = 90000;

const expenseCategories = [
	"شراء بضاعة",
	"فاتورة كهرباء",
	"فاتورة مياه",
	"إيجار",
	"رواتب",
	"صيانة",
	"أخرى",
];

export default function ExpenseModal({ onClose, onSaved }) {
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState(expenseCategories[0]);
	const [amount, setAmount] = useState("");
	const [amountUsd, setAmountUsd] = useState("");
 	const [notes, setNotes] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const updateLbpAmount = (value) => {
		setAmount(value);
		const numericAmount = Number(value);
		setAmountUsd(value === "" || !Number.isFinite(numericAmount) ? "" : (numericAmount / EXCHANGE_RATE).toFixed(2));
	};

	const updateUsdAmount = (value) => {
		setAmountUsd(value);
		const numericAmount = Number(value);
		setAmount(value === "" || !Number.isFinite(numericAmount) ? "" : String(Math.round(numericAmount * EXCHANGE_RATE)));
	};

	const saveExpense = async (event) => {
		event.preventDefault();
		const numericAmount = Number(amount);

		if (!title.trim()) {
			setError("اكتب نوع أو وصف المصروف");
			return;
		}

		if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
			setError("أدخل مبلغاً صحيحاً أكبر من صفر");
			return;
		}

		try {
			setSaving(true);
			setError("");
			const response = await fetch("/api/expenses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					category,
					amount: numericAmount,
					amountUsd: Number(amountUsd),
					exchangeRate: EXCHANGE_RATE,
					notes: notes.trim(),
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save expense");
			}

			onSaved();
		} catch (saveError) {
			console.error("Error saving expense:", saveError);
			setError("حدث خطأ أثناء حفظ المصروف");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
			<form onSubmit={saveExpense} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
				<div className="mb-5 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-gray-800">إضافة مصروف</h2>
					<button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800" aria-label="إغلاق">
						×
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label htmlFor="expense-title" className="mb-1 block font-semibold text-gray-800">نوع أو وصف المصروف</label>
						<input id="expense-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: شراء خضار" className="w-full rounded border border-gray-400 px-3 py-2 text-black" autoFocus />
					</div>

					<div>
						<label htmlFor="expense-category" className="mb-1 block font-semibold text-gray-800">التصنيف</label>
						<select id="expense-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded border border-gray-400 px-3 py-2 text-black">
							{expenseCategories.map((expenseCategory) => <option key={expenseCategory} value={expenseCategory}>{expenseCategory}</option>)}
						</select>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div>
							<label htmlFor="expense-amount-lbp" className="mb-1 block font-semibold text-gray-800">المبلغ بالليرة (ل.ل.)</label>
							<input id="expense-amount-lbp" type="number" min="1" step="1" value={amount} onChange={(event) => updateLbpAmount(event.target.value)} placeholder="0" className="w-full rounded border border-gray-400 px-3 py-2 text-black" />
						</div>
						<div>
							<label htmlFor="expense-amount-usd" className="mb-1 block font-semibold text-gray-800">المبلغ بالدولار ($)</label>
							<input id="expense-amount-usd" type="number" min="0.01" step="0.01" value={amountUsd} onChange={(event) => updateUsdAmount(event.target.value)} placeholder="0.00" className="w-full rounded border border-gray-400 px-3 py-2 text-black" />
						</div>
					</div>
					<p className="text-sm text-gray-600">سعر الصرف: 1$ = {EXCHANGE_RATE.toLocaleString()} ل.ل. ويتم الحفظ بالليرة.</p>

					<div>
						<label htmlFor="expense-notes" className="mb-1 block font-semibold text-gray-800">ملاحظات (اختياري)</label>
						<textarea id="expense-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows="2" className="w-full rounded border border-gray-400 px-3 py-2 text-black" />
					</div>
				</div>

				{error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

				<div className="mt-5 flex gap-3">
					<button type="submit" disabled={saving} className="flex-1 rounded bg-orange-500 py-2 font-bold text-white hover:bg-orange-600 disabled:bg-gray-400">
						{saving ? "جاري الحفظ..." : "حفظ المصروف"}
					</button>
					<button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded bg-gray-500 py-2 font-bold text-white hover:bg-gray-600 disabled:bg-gray-400">إلغاء</button>
				</div>
			</form>
		</div>
	);
}
