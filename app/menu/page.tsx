"use client";

import React, { useState, useEffect } from "react";

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

  return (
    <div className="min-h-screen bg-[#FBF8EF] py-8 px-4 flex justify-center items-center">
      {/* Outer Card Frame */}
      <div className="w-full max-w-4xl bg-[#FFFDF7] border-4 border-[#1E4329] rounded-lg p-3 sm:p-6 shadow-2xl relative">
        {/* Inner Gold Line Border Frame */}
        <div className="border-2 border-[#E5A93C] p-4 sm:p-8 rounded relative min-h-200">
          
          {/* Top Decorative Leaf */}
          <div className="flex justify-center -mt-7 mb-2">
            <svg className="w-8 h-8 text-[#1E4329] fill-current" viewBox="0 0 24 24">
              <path d="M17,8C15.31,8 13.5,9.13 12,10.61C10.5,9.13 8.69,8 7,8C4.33,8 2,10.15 2,13C2,17.5 7.33,20 12,22C16.67,20 22,17.5 22,13C22,10.15 19.67,8 17,8Z" />
            </svg>
          </div>

          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#1E4329] overflow-hidden shadow-md flex items-center justify-center bg-white">
              <img
                src="/logo.jpeg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title Banner "قائمة الطعام" */}
          <div className="flex justify-center mb-10">
            <div className="relative bg-[#E5A93C] text-[#1E4329] font-extrabold text-2xl sm:text-3xl px-12 py-2 rounded-md shadow-sm border border-[#C28B23]">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-[#E5A93C]"></div>
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-[#E5A93C]"></div>
              قائمة الطعام
            </div>
          </div>

          {/* Menu Items List */}
          {menuItems.length > 0 ? (
            <div className="space-y-6 sm:space-y-8">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-12 gap-2 sm:gap-4 items-center border-b border-dashed border-[#E3D4B9] pb-5 last:border-0"
                >
                  {/* Left Side: English Name & Description */}
                  <div className="col-span-5 text-left">
                    <h3 className="text-lg sm:text-2xl font-bold text-[#1E4329] leading-tight">
                      {item.nameEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C4A38] mt-1 leading-snug">
                      {item.descEn}
                    </p>
                  </div>

                  {/* Middle Side: Price */}
                  <div className="col-span-2 text-center">
                    <span className="text-base sm:text-2xl font-black text-[#D99824]">
                      {typeof item.price === "number"
                        ? `${item.price.toLocaleString()} L.L.`
                        : item.price}
                    </span>
                    {typeof item.price === "number" && (
                      <div className="text-xs sm:text-sm font-bold text-[#5C4A38] mt-1">
                        ${(item.price / EXCHANGE_RATE).toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Arabic Name & Description */}
                  <div className="col-span-5 text-right" dir="rtl">
                    <h3 className="text-lg sm:text-2xl font-bold text-[#1E4329] leading-tight">
                      {item.nameAr}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C4A38] mt-1 leading-snug">
                      {item.descAr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-[#1E4329] font-bold dir-rtl">
                لا توجد منتجات حالياً
              </p>
            </div>
          )}

          {/* Bottom Decorative Leaf */}
          <div className="flex justify-center mt-12">
            <svg className="w-8 h-8 text-[#1E4329] fill-current transform rotate-180" viewBox="0 0 24 24">
              <path d="M17,8C15.31,8 13.5,9.13 12,10.61C10.5,9.13 8.69,8 7,8C4.33,8 2,10.15 2,13C2,17.5 7.33,20 12,22C16.67,20 22,17.5 22,13C22,10.15 19.67,8 17,8Z" />
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Menu;