"use client";

import { useEffect, useMemo, useState } from "react";

type ReportType = "activity" | "profit" | "cashflow";

type Expense = {
  amount?: number;
};

type Product = {
  _id?: string;
  cost?: number;
  montageCost?: number;
};

type Sale = {
  _id?: string;
  saleId?: string;
  date?: string;
  createdAt?: string;
  totalAmount?: number;
  amount?: number;
  subtotal?: number;
  paymentMethod?: string;
  status?: string;
  cashierName?: string;
  items?: Array<{ productId?: string; quantity?: number; unitCost?: number; cost?: number }>;
};

const EXCHANGE_RATE = 90000;

const formatCurrency = (amount: number) => {
  const value = Number(amount) || 0;
  return `L.L ${value.toLocaleString("en-US")} ($${(value / EXCHANGE_RATE).toFixed(2)})`;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

const getSaleAmount = (sale: Sale) => sale.totalAmount ?? sale.amount ?? sale.subtotal ?? 0;

const getSaleCost = (sale: Sale, productCosts: Map<string, number>) =>
  (sale.items ?? []).reduce(
    (total, item) =>
      total + (item.unitCost ?? item.cost ?? productCosts.get(item.productId ?? "") ?? 0) * (item.quantity ?? 0),
    0
  );

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("activity");
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSales = async () => {
      try {
        const [salesResponse, expensesResponse, productsResponse] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/expenses"),
          fetch("/api/products"),
        ]);
        if (!salesResponse.ok || !expensesResponse.ok || !productsResponse.ok) throw new Error("Unable to load report data");
        const [salesData, expensesData, productsData] = await Promise.all([
          salesResponse.json(),
          expensesResponse.json(),
          productsResponse.json(),
        ]);
        if (!Array.isArray(salesData) || !Array.isArray(expensesData) || !Array.isArray(productsData)) throw new Error("Invalid report response");
        setSales(salesData);
        setExpenses(expensesData);
        setProducts(productsData);
      } catch (loadError) {
        console.error("Error loading report data:", loadError);
        setError("We could not load the report data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const completedSales = useMemo(
    () => sales.filter((sale) => sale.status !== "cancelled" && sale.status !== "refunded"),
    [sales]
  );
  const totalRevenue = useMemo(
    () => completedSales.reduce((total, sale) => total + getSaleAmount(sale), 0),
    [completedSales]
  );
  const averageSale = completedSales.length ? totalRevenue / completedSales.length : 0;
  const productCosts = useMemo(
    () => new Map(products.map((product) => [product._id ?? "", product.cost ?? product.montageCost ?? 0])),
    [products]
  );
  const totalCost = useMemo(
    () => completedSales.reduce((total, sale) => total + getSaleCost(sale, productCosts), 0),
    [completedSales, productCosts]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((total, expense) => total + (expense.amount ?? 0), 0),
    [expenses]
  );
  const totalOutflow = totalCost + totalExpenses;
  const netProfit = totalRevenue - totalOutflow;

  const reportButtons: Array<{ id: ReportType; label: string; description: string }> = [
    { id: "activity", label: "All Activity", description: "Every completed sale" },
    { id: "profit", label: "Profit Report", description: "Revenue and profit overview" },
    { id: "cashflow", label: "Cashflow Report", description: "Money in and money out" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Restaurant POS</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Reports</h1>
            <p className="mt-2 text-slate-600">Review sales performance and daily movement of money.</p>
          </div>
          <a href="/admin/dashboard" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
            Back to dashboard
          </a>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3" aria-label="Report types">
          {reportButtons.map((button) => {
            const active = reportType === button.id;
            return (
              <button
                key={button.id}
                type="button"
                onClick={() => setReportType(button.id)}
                className={`rounded-xl border p-5 text-left transition ${
                  active
                    ? "border-teal-700 bg-teal-700 text-white shadow-lg shadow-teal-900/15"
                    : "border-slate-200 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-50"
                }`}
                aria-pressed={active}
              >
                <span className="block text-lg font-bold">{button.label}</span>
                <span className={`mt-1 block text-sm ${active ? "text-teal-50" : "text-slate-500"}`}>
                  {button.description}
                </span>
              </button>
            );
          })}
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
        ) : loading ? (
          <div className="rounded-xl bg-white p-12 text-center text-slate-500 shadow-sm">Loading reports...</div>
        ) : (
          <>
            {reportType === "activity" && (
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-1 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">All Activity</h2>
                    <p className="text-sm text-slate-500">{completedSales.length} completed transactions</p>
                  </div>
                  <p className="font-bold text-teal-700">{formatCurrency(totalRevenue)}</p>
                </div>
                <ActivityTable sales={completedSales} />
              </section>
            )}

            {reportType === "profit" && (
              <ReportPanel title="Profit Report" subtitle="A summary based on recorded sales.">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Metric label="Gross revenue" value={formatCurrency(totalRevenue)} />
                  <Metric label="Product cost" value={formatCurrency(totalCost)} />
                  <Metric label="Expenses" value={formatCurrency(totalExpenses)} />
                  <Metric label="Net profit" value={formatCurrency(netProfit)} accent />
                </div>
                <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  Net profit = gross revenue - product cost - expenses. Expenses are currently {formatCurrency(totalExpenses)}.
                </p>
              </ReportPanel>
            )}

            {reportType === "cashflow" && (
              <ReportPanel title="Cashflow Report" subtitle="Cash movement from recorded transactions.">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Metric label="Money in" value={formatCurrency(totalRevenue)} accent />
                  <Metric label="Money out" value={formatCurrency(totalOutflow)} />
                  <Metric label="Net cashflow" value={formatCurrency(netProfit)} accent />
                </div>
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="mb-4 font-bold">Payment method breakdown</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {(["cash", "card", "check", "online"] as const).map((method) => {
                      const amount = completedSales
                        .filter((sale) => sale.paymentMethod === method)
                        .reduce((total, sale) => total + getSaleAmount(sale), 0);
                      return <Metric key={method} label={method} value={formatCurrency(amount)} />;
                    })}
                  </div>
                </div>
              </ReportPanel>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Metric label="Total transactions" value={completedSales.length.toLocaleString("en-US")} />
              <Metric label="Average transaction" value={formatCurrency(averageSale)} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ReportPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent ? "text-teal-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function ActivityTable({ sales }: { sales: Sale[] }) {
  if (!sales.length) {
    return <div className="p-10 text-center text-slate-500">No completed activity found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-155 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Sale ID</th>
            <th className="px-6 py-4 font-semibold">Payment</th>
            <th className="px-6 py-4 font-semibold">Cashier</th>
            <th className="px-6 py-4 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sales.map((sale) => (
            <tr key={sale._id ?? sale.saleId ?? `${sale.date}-${getSaleAmount(sale)}`} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-slate-600">{formatDate(sale.date ?? sale.createdAt)}</td>
              <td className="px-6 py-4 font-medium">{sale.saleId ?? sale._id?.slice(-8) ?? "-"}</td>
              <td className="px-6 py-4 capitalize text-slate-600">{sale.paymentMethod ?? "-"}</td>
              <td className="px-6 py-4 text-slate-600">{sale.cashierName ?? "-"}</td>
              <td className="px-6 py-4 text-right font-bold text-teal-700">{formatCurrency(getSaleAmount(sale))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
