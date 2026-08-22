"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      }if(data.user.role=="cashier"){
        router.push("/cashier")
      } 

      
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#f4f1ea] to-[#e8dfd0] flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
      `}</style>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-4 border-[#2c3e2c] bg-[#f4f1ea] mb-4 shadow-lg overflow-hidden">
            <img
              src="/logo.jpeg"
              alt="Restaurant logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = '/logo-fallback.svg';
              }}
            />
          </div>
          <h2 className="text-3xl font-bold text-[#2c3e2c]">تسجيل الدخول</h2>
          <p className="text-[#6b7c6b] mt-2">نظام إدارة المطعم</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#d4a574]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-[#2c3e2c] font-bold mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#d1c4a9] focus:border-[#8b5a2b] focus:outline-none transition-colors text-right text-stone-950"
                placeholder="أدخل اسم المستخدم"
                required
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[#2c3e2c] font-bold mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#d1c4a9] focus:border-[#8b5a2b] focus:outline-none transition-colors text-right text-black"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2c3e2c] hover:bg-[#1a281a] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري التسجيل...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-[#d1c4a9]">
            <p className="text-sm text-[#6b7c6b] text-center mb-3">حسابات تجريبية:</p>
            <div className="space-y-2 text-sm">
              <div className="bg-[#f4f1ea] p-3 rounded-lg">
                <p className="text-[#2c3e2c] font-bold">مدير النظام:</p>
                <p className="text-[#6b7c6b]">admin / admin123</p>
              </div>
              <div className="bg-[#f4f1ea] p-3 rounded-lg">
                <p className="text-[#2c3e2c] font-bold">كاشير:</p>
                <p className="text-[#6b7c6b]">cashier / cashier123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#6b7c6b] mt-6 text-sm">
          © 2026 خبزة وزيتونة - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}