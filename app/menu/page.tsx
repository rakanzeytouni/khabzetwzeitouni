"use client";

import React, { useState, useEffect, useMemo } from "react";

const EXCHANGE_RATE = 90000;

type MenuItemType = {
  _id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  price: number;
  category?: string;
  active?: boolean;
  image?: string;
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();

    menuItems.forEach((item) => {
      if (item.category && item.category.trim() !== "") {
        cats.add(item.category);
      }
    });

    return Array.from(cats);
  }, [menuItems]);

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.active === false) return false;

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesSearch =
        !searchQuery ||
        item.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameAr?.includes(searchQuery) ||
        item.descEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.descAr?.includes(searchQuery);

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FBF8EF] px-3 py-5 sm:px-6 sm:py-10 font-sans antialiased text-[#1E4329]">
      <div className="mx-auto max-w-5xl">

        {/* Main Menu */}
        <div className="overflow-hidden rounded-[28px] border border-[#E3D4B9] bg-[#FFFDF7] shadow-[0_20px_70px_rgba(30,67,41,0.10)]">

          {/* Header */}
          <div className="relative px-5 pb-7 pt-7 sm:px-10 sm:pb-9 sm:pt-10">

            {/* Soft decorative background */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#E5A93C]/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 top-24 h-48 w-48 rounded-full bg-[#1E4329]/5 blur-3xl" />

            {/* Logo */}
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-[#E5A93C]/15 blur-xl" />

                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#1E4329] bg-white shadow-[0_10px_30px_rgba(30,67,41,0.15)] sm:h-36 sm:w-36">
                  <img
                    src="/logo.jpeg"
                    alt="Restaurant Logo"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Restaurant heading */}
            <div className="relative mt-6 text-center">
              <div className="mb-2 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-[#E5A93C] sm:w-16" />

                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D99824] sm:text-xs">
                  Our Menu
                </span>

                <span className="h-px w-10 bg-[#E5A93C] sm:w-16" />
              </div>

              <h1
                className="text-3xl font-black tracking-tight text-[#1E4329] sm:text-5xl"
                dir="rtl"
              >
                قائمة الطعام
              </h1>

              <p className="mt-2 text-xs font-medium text-[#5C4A38]/70 sm:text-sm">
                Fresh • Simple • Delicious
              </p>
            </div>
          </div>

          {/* Navigation */}
          {!loading && menuItems.length > 0 && (
            <div className="sticky top-0 z-20 border-y border-[#E3D4B9] bg-[#FFFDF7]/95 px-4 py-4 backdrop-blur-md sm:px-8">

              {/* Search */}
              <div className="mx-auto max-w-xl">
                <div className="relative">
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1E4329]/60">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                  </div>

                  <input
                    type="text"
                    placeholder="إبحث عن وجبة / Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-[#E3D4B9] bg-[#FBF8EF] py-3 pl-11 pr-12 text-center text-sm font-medium text-[#1E4329] outline-none transition-all placeholder:text-[#5C4A38]/50 focus:border-[#1E4329] focus:bg-white focus:ring-4 focus:ring-[#1E4329]/5"
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1E4329]/10 text-xs font-bold text-[#1E4329] transition hover:bg-[#1E4329] hover:text-white"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:justify-center">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
                      selectedCategory === "all"
                        ? "bg-[#1E4329] text-[#FFFDF7] shadow-md shadow-[#1E4329]/20"
                        : "border border-[#E3D4B9] bg-[#FBF8EF] text-[#5C4A38] hover:border-[#1E4329] hover:text-[#1E4329]"
                    }`}
                  >
                    الكل / All
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 sm:text-sm ${
                        selectedCategory === cat
                          ? "bg-[#1E4329] text-[#FFFDF7] shadow-md shadow-[#1E4329]/20"
                          : "border border-[#E3D4B9] bg-[#FBF8EF] text-[#5C4A38] hover:border-[#1E4329] hover:text-[#1E4329]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Content */}
          <div className="px-4 py-6 sm:px-10 sm:py-10">

            {/* Loading */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="animate-pulse overflow-hidden rounded-2xl border border-[#E3D4B9] bg-[#FFFDF7]"
                  >
                    <div className="h-48 bg-[#E3D4B9]/30 sm:h-52" />

                    <div className="space-y-3 p-5">
                      <div className="h-5 w-2/3 rounded bg-[#E3D4B9]/40" />
                      <div className="h-3 w-full rounded bg-[#E3D4B9]/25" />
                      <div className="h-3 w-4/5 rounded bg-[#E3D4B9]/25" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (

              /* Menu Items */
              <div className="grid gap-5 sm:grid-cols-2">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="group overflow-hidden rounded-2xl border border-[#E3D4B9] bg-[#FFFDF7] transition-all duration-300 hover:-translate-y-1 hover:border-[#D99824]/50 hover:shadow-[0_14px_35px_rgba(30,67,41,0.10)]"
                  >

                    {/* Image */}
                    {item.image ? (
                      <div className="relative h-52 overflow-hidden bg-[#FBF8EF] sm:h-56">
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />

                        {/* Image overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1E4329]/35 to-transparent" />

                        {/* Price */}
                        <div className="absolute bottom-3 right-3 rounded-xl border border-white/40 bg-[#FFFDF7]/95 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
                          <span className="block text-lg font-black leading-none text-[#D99824]">
                            {typeof item.price === "number"
                              ? item.price.toLocaleString()
                              : item.price}
                          </span>

                          <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-[#1E4329]">
                            L.L.
                          </span>

                          {typeof item.price === "number" && (
                            <span className="mt-0.5 block border-t border-[#E3D4B9] pt-0.5 text-[9px] font-bold text-[#5C4A38]">
                              ${(item.price / EXCHANGE_RATE).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex h-24 items-center justify-end border-b border-[#E3D4B9] bg-[#FBF8EF] px-4 sm:h-28">
                        <div className="rounded-xl border border-[#E3D4B9] bg-[#FFFDF7] px-4 py-2 text-center shadow-sm">
                          <span className="block text-lg font-black leading-none text-[#D99824]">
                            {typeof item.price === "number"
                              ? item.price.toLocaleString()
                              : item.price}
                          </span>

                          <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-[#1E4329]">
                            L.L.
                          </span>

                          {typeof item.price === "number" && (
                            <span className="mt-0.5 block border-t border-[#E3D4B9] pt-0.5 text-[9px] font-bold text-[#5C4A38]">
                              ${(item.price / EXCHANGE_RATE).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="p-5 sm:p-6">

                      {/* English */}
                      <div className="text-left">
                        <h3 className="text-lg font-black leading-tight text-[#1E4329] transition-colors group-hover:text-[#D99824] sm:text-xl">
                          {item.nameEn}
                        </h3>

                        {item.descEn && (
                          <p className="mt-1.5 text-xs leading-relaxed text-[#5C4A38]/80 sm:text-sm">
                            {item.descEn}
                          </p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-[#E3D4B9]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E5A93C]" />
                        <span className="h-px flex-1 bg-[#E3D4B9]" />
                      </div>

                      {/* Arabic */}
                      <div className="text-right" dir="rtl">
                        <h3 className="text-lg font-black leading-tight text-[#1E4329] transition-colors group-hover:text-[#D99824] sm:text-xl">
                          {item.nameAr}
                        </h3>

                        {item.descAr && (
                          <p className="mt-1.5 text-xs leading-relaxed text-[#5C4A38]/80 sm:text-sm">
                            {item.descAr}
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            ) : (

              /* Empty State */
              <div className="rounded-2xl border border-dashed border-[#E3D4B9] bg-[#FBF8EF]/60 px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1E4329]/10">
                  <svg
                    className="h-6 w-6 text-[#1E4329]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>

                <p
                  className="mt-4 text-lg font-black text-[#1E4329]"
                  dir="rtl"
                >
                  لا توجد منتجات مطابقة للبحث
                </p>

                <p className="mt-1 text-xs text-[#5C4A38]/70">
                  No items found matching your filter
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#E3D4B9] bg-[#FBF8EF]/50 px-5 py-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-[#E5A93C]" />
              <span className="h-2 w-2 rotate-45 bg-[#E5A93C]" />
              <span className="h-px w-10 bg-[#E5A93C]" />
            </div>

            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1E4329]/60">
              Enjoy your meal
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Menu;