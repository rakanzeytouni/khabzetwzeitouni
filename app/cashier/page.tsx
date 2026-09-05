"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ExpenseModal = dynamic(() => import("@/components/ExpenseModal"));
const LoanModal = dynamic(() => import("@/components/LoanModal"));

interface MenuItem {
  _id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  cost?: number;
  montageCost?: number;
  category: string;
  image?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Sale {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  customerName?: string;
}
  const LogoutIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const EXCHANGE_RATE = 90000;


export default function Cashier() {
  const router = useRouter();
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentCurrency, setPaymentCurrency] = useState<"lbp" | "usd">("lbp");
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState<any | null>(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("خطأ في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const addNewCustomer = async () => {
    try {
      setAddingCustomer(true);
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customerName }),
      });

      if (!res.ok) throw new Error("Failed to add customer");
      setShowCustomerForm(false);
      alert(`تمت إضافة الزبون ${customerName.trim() || "None"}`);
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("خطأ في إضافة الزبون");
    } finally {
      setAddingCustomer(false);
    }
  };

  const addToCart = (product: MenuItem) => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = 0; // Removed 10% tax
    const totalAmount = subtotal + tax;

    return {
      subtotal,
      tax,
      totalAmount,
    };
  };

  const { subtotal, tax, totalAmount } = calculateTotals();
  const paidAmountInLbp = paymentCurrency === "usd" ? amountPaid * EXCHANGE_RATE : amountPaid;
  const change = Math.max(0, paidAmountInLbp - totalAmount);

  const completeSale = async () => {
    if (cart.length === 0) {
      alert("السلة فارغة");
      return;
    }

    if (paidAmountInLbp < totalAmount) {
      alert("المبلغ المدفوع أقل من الإجمالي");
      return;
    }
const uniqueSaleId = `SALE-${Date.now()}`;
    try {
      setLoading(true);
      const saleData = {
        saleId: uniqueSaleId,
        items: cart.map((item) => ({
          productId: item._id,
          productName: item.nameAr,
          quantity: item.quantity,
          unitPrice: item.price,
          unitCost: item.cost ?? item.montageCost ?? 0,
          totalPrice: item.price * item.quantity,
        })),
        subtotal,
        tax,
        totalAmount,
        paymentMethod,
        amountPaid: paidAmountInLbp,
        amountPaidInput: amountPaid,
        paymentCurrency,
        change,
        changeInPaymentCurrency: paymentCurrency === "usd" ? change / EXCHANGE_RATE : change,
        customerName,
        cashierName: "كاشير",
        status: "completed",
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (!res.ok) throw new Error("Failed to complete sale");

      // Clear cart
      setCart([]);
      setAmountPaid(0);
      setPaymentCurrency("lbp");
      setCustomerName("");
      setShowPayment(false);
      setReceiptToPrint(saleData);
    } catch (error) {
      console.error("Error completing sale:", error);
      alert("خطأ في إكمال البيع");
    } finally {
      setLoading(false);
    }
  };

  const openLoanModal = () => {
    if (cart.length === 0) {
      alert("السلة فارغة");
      return;
    }
    setShowLoanModal(true);
  };

  const loanSaleData = {
    saleId: `SALE-${Date.now()}`,
    items: cart.map((item) => ({
      productId: item._id,
      productName: item.nameAr,
      quantity: item.quantity,
      unitPrice: item.price,
      unitCost: item.cost ?? item.montageCost ?? 0,
      totalPrice: item.price * item.quantity,
    })),
    subtotal,
    tax,
    totalAmount,
    customerName,
    cashierName: "كاشير",
  };

  const printReceipt = (saleData: any) => {
    const receiptWindow = window.open("", "", "width=400,height=600");
    if (receiptWindow) {
      const receiptHTML = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>إيصال</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 20px; }
            .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
            table { width: 100%; margin: 20px 0; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: right; }
            .total { font-weight: bold; font-size: 16px; margin-top: 20px; }
            .footer { margin-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">إيصال المبيعات</div>
          <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
          ${customerName ? `<p>العميل: ${customerName}</p>` : ""}
          <table>
            <tr>
              <th>الكمية</th>
              <th>السعر</th>
              <th>المنتج</th>
            </tr>
            ${saleData.items
              .map(
                (item: any) => `
              <tr>
                <td>${item.quantity}</td>
                <td>${item.totalPrice.toLocaleString()} L.L.</td>
                <td>${item.productName}</td>
              </tr>
            `
              )
              .join("")}
          </table>
          <div class="total">
            <p>المجموع: ${saleData.subtotal.toLocaleString()} L.L.</p>
            <p>الإجمالي (L.L.): ${saleData.totalAmount.toLocaleString()} L.L.</p>
            <p>الإجمالي (USD): $${(saleData.totalAmount / EXCHANGE_RATE).toFixed(2)}</p>
            <hr style="margin: 10px 0; border: 1px dashed #000;" />
            <p>المبلغ المدفوع: ${saleData.amountPaidInput.toLocaleString()} ${saleData.paymentCurrency === "usd" ? "$" : "L.L."}</p>
            <p>قيمة المدفوع بالليرة: ${saleData.amountPaid.toLocaleString()} L.L.</p>
            <p>الباقي: ${saleData.changeInPaymentCurrency.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${saleData.paymentCurrency === "usd" ? "$" : "L.L."}</p>
            <p>الباقي بالليرة: ${saleData.change.toLocaleString()} L.L.</p>
            <p>الباقي بالدولار: $${(saleData.change / EXCHANGE_RATE).toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>سعر الصرف: ${EXCHANGE_RATE.toLocaleString()} L.L.</p>
            شكراً لتعاملك معنا
          </div>
        </body>
        </html>
      `;
      receiptWindow.document.write(receiptHTML);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

    const handleLogout = async () => {
    try {
      // 1. منطلب من السيرفر يمسح الـ HTTP-Only Cookie
      await fetch("/api/auth/logout", {
        method: "POST", // تأكد إنها POST
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 2. مننظف أي شي مخزن بالمتصفح (LocalStorage)
      localStorage.clear();
      sessionStorage.clear();

      // 3. بنعمل Refresh قوي وبننقل اليوزر لصفحة الـ Login مش الـ Menu 
      // (عشان تتأكد إنه انمسح وما رح يفوته عالدشيبورد)
      window.location.href = "/login";
      
    } catch (error) {
      console.error("Error logging out:", error);
      window.location.href = "/login";
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* هون عدلناها لتضل صف واحد (بالزاوية) على التلفون والكمبيوتر */}
        <div className="mb-8 flex flex-row items-center justify-between gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
            نقطة البيع
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 sm:px-6 rounded-lg shadow transition duration-200 text-sm sm:text-base"
            >
              مصروف
            </button>
            <button
              onClick={() => router.push("/loans")}
              className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 sm:px-6 rounded-lg shadow transition duration-200 text-sm sm:text-base"
            >
              قروضي
            </button>
            <button
              onClick={() => setShowCustomerForm(true)}
              disabled={addingCustomer}
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 sm:px-6 rounded-lg shadow transition duration-200 text-sm sm:text-base"
            >
              زبون جديد
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 sm:px-6 rounded-lg shadow transition duration-200 text-sm sm:text-base"
            >
              تسجيل خروج
              <LogoutIcon />
            </button>
          </div>
        </div>

        {showCustomerForm && (
          <div className="mb-6 rounded-lg border-r-4 border-green-500 bg-white p-5 shadow-md">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-60 flex-1 text-gray-700">
                اسم الزبون (اختياري)
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="اتركه فارغاً لإضافة None"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-green-500"
                />
              </label>
              <button
                type="button"
                onClick={addNewCustomer}
                disabled={addingCustomer}
                className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {addingCustomer ? "جاري الإضافة..." : "حفظ الزبون"}
              </button>
              <button
                type="button"
                onClick={() => setShowCustomerForm(false)}
                className="rounded-lg bg-gray-200 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">المنتجات</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {loading && products.length === 0
                  ? Array.from({ length: 9 }, (_, index) => (
                      <div
                        key={`product-skeleton-${index}`}
                        aria-hidden="true"
                        className="h-28 animate-pulse rounded-lg bg-gray-200"
                      />
                    ))
                  : products.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => addToCart(product)}
                        className="bg-linear-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-lg transition transform hover:scale-105 text-center"
                      >
                        <p className="font-semibold text-lg">{product.nameAr}</p>
                        <p className="text-sm opacity-90">{product.nameEn}</p>
                        <p className="text-xl font-bold mt-2">{product.price.toLocaleString()} L.L.</p>
                      </button>
                    ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">السلة</h2>

            {/* Cart Items */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto mb-4">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg p-3 mb-3 border-l-4 border-blue-500"
                  >
                    <p className="font-semibold text-gray-800">{item.nameAr}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item._id, parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-black font-bold text-center border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {(item.price * item.quantity).toLocaleString()} L.L.
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white text-sm py-1 rounded"
                    >
                      حذف
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">السلة فارغة</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-200 pt-4 space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">المجموع:</span>
                <span className="font-semibold text-gray-800">{subtotal.toLocaleString()} L.L.</span>
              </div>
              {/* Removed Tax display */}
              <div className="flex justify-between items-center font-bold bg-yellow-100 p-3 rounded">
                <span className="text-gray-800">الإجمالي:</span>
                <div className="text-right">
                  <div className="text-lg text-gray-900">{totalAmount.toLocaleString()} L.L.</div>
                  <div className="text-sm text-gray-600">${(totalAmount / EXCHANGE_RATE).toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {showPayment ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg space-y-3 mb-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    اسم العميل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-black font-medium border border-gray-400 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    طريقة الدفع
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-black font-medium border border-gray-400 rounded px-3 py-2"
                  >
                    <option value="cash">نقداً</option>
                    <option value="card">بطاقة</option>
                    <option value="online">تحويل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    عملة الدفع
                  </label>
                  <select
                    value={paymentCurrency}
                    onChange={(e) => {
                      setPaymentCurrency(e.target.value as "lbp" | "usd");
                      setAmountPaid(0);
                    }}
                    className="w-full text-black font-medium border border-gray-400 rounded px-3 py-2"
                  >
                    <option value="lbp">ليرة لبنانية (L.L.)</option>
                    <option value="usd">دولار أمريكي ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    المبلغ المدفوع ({paymentCurrency === "usd" ? "$" : "L.L."})
                  </label>
                  <input
                    type="number"
                    value={amountPaid === 0 ? "" : amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full text-black font-medium border border-gray-400 rounded px-3 py-2"
                    min="0"
                    step={paymentCurrency === "usd" ? "0.01" : "1"}
                  />
                </div>

                {paidAmountInLbp >= totalAmount && (
                  <div className="bg-green-100 border border-green-300 p-3 rounded flex justify-between items-center text-green-900 font-bold">
                    <span>الباقي:</span>
                    <div className="text-right">
                      <div>{change.toLocaleString()} L.L.</div>
                      <div className="text-sm opacity-80">${(change / EXCHANGE_RATE).toFixed(2)}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={completeSale}
                  disabled={loading || paidAmountInLbp < totalAmount}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 rounded transition"
                >
                  إتمام البيع
                </button>

                <button
                  onClick={openLoanModal}
                  className="w-full rounded bg-purple-600 py-2 font-bold text-white transition hover:bg-purple-700"
                >
                  تسجيل كقرض
                </button>

                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded transition"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPayment(true)}
                disabled={cart.length === 0 || loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded transition"
              >
                الدفع
              </button>
            )}

            <button
              onClick={() => {
                setCart([]);
                setAmountPaid(0);
                setShowPayment(false);
              }}
              className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded transition"
            >
              مسح السلة
            </button>
          </div>
        </div>
      </div>
      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSaved={() => {
            setShowExpenseModal(false);
            router.push("/expense");
          }}
        />
      )}
      {showLoanModal && (
        <LoanModal
          totalAmount={totalAmount}
          sale={loanSaleData}
          onClose={() => setShowLoanModal(false)}
          onSaved={() => {
            setCart([]);
            setCustomerName("");
            setShowLoanModal(false);
            setShowPayment(false);
            alert("تم تسجيل القرض بنجاح");
          }}
        />
      )}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
            <h2 className="text-xl font-bold text-gray-800">هل تريد طباعة البيع؟</h2>
            <p className="mt-2 text-gray-600">تم حفظ البيع بنجاح</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  printReceipt(receiptToPrint);
                  setReceiptToPrint(null);
                }}
                className="flex-1 rounded bg-blue-600 py-2 font-bold text-white hover:bg-blue-700"
              >
                طباعة البيع
              </button>
              <button
                type="button"
                onClick={() => setReceiptToPrint(null)}
                className="flex-1 rounded bg-gray-500 py-2 font-bold text-white hover:bg-gray-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}