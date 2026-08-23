"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Simple SVG Icons
const TrendingUpIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10-9l2 9m-6 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BarChartIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

interface DashboardStats {
  monthlySales: number;
  totalCustomers: number;
  totalStaff: number;
  salesTrend: number;
  recentSales: Array<{ date: string; amount?: number; totalAmount?: number }>;
}

// ضفنا هيدي الدالة كرمال ترتب الرقم وتحط الفواصل وتزيد السعر بالدولار
const formatCurrency = (amount: number) => {
  const lbp = amount.toLocaleString("en-US");
  // قسمنا على 90000 كرمال تطلع النتيجة متل ما طلبت (2.5 مليون / 90 الف = 27.78)
  const usd = (amount / 90000).toFixed(2);
  return `L.L ${lbp} ($${usd})`;
};

export default function Dashboard() {
  const router=useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    monthlySales: 0,
    totalCustomers: 0,
    totalStaff: 0,
    salesTrend: 0,
    recentSales: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch sales data
      const salesRes = await fetch("/api/sales");
      const salesData = await salesRes.json();

      // Fetch the persisted customer count
      const customersRes = await fetch("/api/customers");
      if (!customersRes.ok) throw new Error("Failed to fetch customers");
      const customersData = await customersRes.json();

      // Get current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();


      // Calculate monthly sales
      const monthlySales = salesData.reduce(
        (total: number, sale: any) => {
          // Add fallback just in case date is missing in old records
          const saleDate = new Date(sale.date || sale.createdAt || new Date()); 
          if (
            sale.status === "completed" &&
            saleDate.getMonth() === currentMonth &&
            saleDate.getFullYear() === currentYear
          ) {
            // Read from totalAmount or amount (for older records), fallback to 0
            return total + (sale.totalAmount || sale.amount || 0);
          }
          return total;
        },
        0
      );

      setStats({
        monthlySales: monthlySales || 0,
        totalCustomers: customersData.total || 0,
        totalStaff: 0, // Default value, can be fetched from user table
        salesTrend: 12, // Percentage increase
        recentSales: salesData.filter((sale: any) => sale.status === "completed").slice(0, 5),
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <Icon />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">جاري التحميل...</p>
      </div>
    );
  }
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
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - عدلناه ليصير فيه الزر بالزاوية */}
        <div className="mb-8 flex  flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-600">مرحباً بك في لوحة تحكم المدير</p>
        </div>
        {/* زر تسجيل الخروج */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:px-6 rounded-lg shadow transition duration-200 text-sm sm:text-base"
          >
            تسجيل خروج
            <LogoutIcon />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={TrendingUpIcon}
            label="المبيعات الشهرية"
            value={formatCurrency(stats.monthlySales || 0)}
            color="border-blue-500"
          />
          <StatCard
            icon={ShoppingCartIcon}
            label="عدد الزبائن"
            value={stats.totalCustomers}
            color="border-green-500"
          />
          <StatCard
            icon={UsersIcon}
            label="عدد الموظفين"
            value={stats.totalStaff}
            color="border-purple-500"
          />
          <StatCard
            icon={BarChartIcon}
            label="معدل النمو"
            value={`${stats.salesTrend}%`}
            color="border-orange-500"
          />
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              آخر المبيعات
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      التاريخ
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      المبلغ
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales && stats.recentSales.length > 0 ? (
                    stats.recentSales.map((sale, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(sale.date || new Date()).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {/* تم التعديل هون */}
                          {formatCurrency(sale.totalAmount || sale.amount || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            مكتملة
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                        لا توجد مبيعات
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
            <div className="space-y-3">
              <Link
                href="/admin/ubdatemenu"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
              >
                تحديث القائمة
              </Link>
              <Link
                href="/expenses"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
              >
                إدارة النفقات
              </Link>
              <Link
                href="/loans"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
              >
                إدارة القروض
              </Link>
              <Link
                href="/report"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
              >
                عرض التقارير
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ملخص النشاط</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500">
                {stats.totalCustomers}
              </p>
              <p className="text-gray-600 mt-2">عدد الزبائن هذا الشهر</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">
                {stats.totalStaff}
              </p>
              <p className="text-gray-600 mt-2">الموظفين النشطين</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-500">
                {/* تم التعديل هون */}
                {formatCurrency(stats.monthlySales || 0)}
              </p>
              <p className="text-gray-600 mt-2">إجمالي المبيعات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}