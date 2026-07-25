'use client';

import React, { useState } from 'react';

type MenuItemType = {
  name: string;
  price: number;
  description: string;
};

type Category = {
  title: string;
  items: MenuItemType[];
};

type Categories = {
  sandwiches: Category;
  lightMeals: Category;
  desserts: Category;
  additions: Category;
  beverages: Category;
};

type MenuData = {
  restaurantName: string;
  title: string;
  categories: Categories;
};

type CategoryKey = keyof Categories;

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');

  const menuData: MenuData = {
    restaurantName: 'خبزة وزيتونة',
    title: 'قائمة الطعام',
    categories: {
      sandwiches: {
        title: 'السندويشات المميزة',
        items: [
          { name: 'سلامي', price: 550000, description: 'إيمانتال، بندورة، كيس، سبيشال وايت صوص' },
          { name: 'تركي قشقوان', price: 500000, description: 'قشقوان، حلوم، بيستو' },
          { name: 'تركي إيمانتال', price: 550000, description: 'إيمانتال، بندورة، كيس، سبيشال وايت صوص' },
          { name: 'سيتراوور تشيكن', price: 500000, description: 'دجاج طاجن مدخن، جوز' },
          { name: 'تشيكن تشاد', price: 500000, description: 'دجاج، موزاريلا، شريتن، مخل، فليفلة، أوريجانو، صوص أفوكا' },
          { name: 'تشيكن غرازليت', price: 500000, description: 'دجاج، موزاريلا، بارميزان، فليفلة حمرا، خضرة، صفرة' }
        ]
      },
      lightMeals: {
        title: 'الوجبات الخفيفة',
        items: [
          { name: 'لبنة', price: 250000, description: 'بندورة، خيار، زيتون، نعنع' },
          { name: 'لبنة سبيشال', price: 270000, description: 'بندورة، خيار، زيتون، أعشاب عطرية' },
          { name: 'فيتا', price: 320000, description: 'بندورة، خيار، خس، نعنع' },
          { name: 'عكاوي', price: 300000, description: 'بندورة، خيار، خس، زيتون' },
          { name: 'حلوم بيستو', price: 350000, description: 'بيستو، بندورة، خيار، خس' },
          { name: 'حلوم قشقوان', price: 400000, description: 'بيستو، بندورة' }
        ]
      },
      desserts: {
        title: 'الحلويات',
        items: [
          { name: 'قريشة وعسل', price: 300000, description: 'قريشة، عسل' },
          { name: 'شوكوبا', price: 300000, description: 'نوتيلا، موز' }
        ]
      },
      additions: {
        title: 'الإضافات',
        items: [
          { name: 'خبزة الكرواسون', price: 50000, description: '' },
          { name: 'سبيشال ساور صوص', price: 50000, description: '' },
          { name: 'بوفلو صوص', price: 50000, description: '' }
        ]
      },
      beverages: {
        title: 'المشروبات',
        items: [
          { name: 'برتقال طازج', price: 200000, description: '' },
          { name: 'ليموناضة طازجة', price: 200000, description: '' },
          { name: 'شراب الورد', price: 200000, description: '' },
          { name: 'شراب التوت', price: 200000, description: '' }
        ]
      }
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ل.ل`;
  };

  const MenuItem = ({ item }: { item: MenuItemType }) => (
    <div className="flex items-end justify-between mb-6 group w-full">
      {/* Text Content */}
      <div className="flex flex-col max-w-[65%] md:max-w-[75%]">
        <h3 className="font-bold text-lg md:text-xl text-[#2c3e2c] group-hover:text-[#8b5a2b] transition-colors duration-300">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs md:text-sm text-[#6b7c6b] mt-1.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Dotted Line */}
      <div className="grow border-b-2 border-dotted border-[#d1c4a9] mx-3 md:mx-4 mb-2 opacity-70 group-hover:border-[#8b5a2b] transition-colors duration-300"></div>

      {/* Price */}
      <div className="font-extrabold text-[#2c3e2c] whitespace-nowrap text-base md:text-lg bg-transparent pl-1 mb-1">
        {formatPrice(item.price)}
      </div>
    </div>
  );

  const CategorySection = ({ categoryKey, category }: { categoryKey: CategoryKey; category: Category }) => (
    <div className="mb-8 md:mb-10 bg-white/60 p-5 md:p-8 rounded-3xl border border-[#e0d8c8] shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-center mb-8 gap-3">
        <div className="h-[2px] w-8 md:w-16 bg-gradient-to-l from-transparent to-[#bfa77d]"></div>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#2c3e2c] text-center">{category.title}</h2>
        <div className="h-[2px] w-8 md:w-16 bg-gradient-to-r from-transparent to-[#bfa77d]"></div>
      </div>
      <div className="flex flex-col">
        {category.items.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f1ea] p-3 sm:p-6 md:p-10 lg:p-12 font-['Tajawal',sans-serif] selection:bg-[#bfa77d] selection:text-white">
      {/* Import Font & Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        /* Hide scrollbar for mobile navigation */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-6xl mx-auto bg-[#fdfbf7] rounded-[2rem] shadow-2xl border border-[#e0d8c8] relative overflow-hidden">
        
        {/* Top decorative edge */}
        <div className="h-4 w-full bg-[#2c3e2c] opacity-90"></div>

        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#2c3e2c 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        ></div>

        <div className="p-5 sm:p-8 md:p-12 lg:p-16 relative z-10">
          
          {/* Header */}
          <header className="text-center mb-10 md:mb-16">
            <div className="inline-flex flex-col items-center justify-center w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#2c3e2c] bg-[#fdfbf7] mb-6 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#bfa77d] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <h1 className="text-2xl md:text-4xl font-black text-[#2c3e2c] leading-tight">
                خبزة<br/>
                <span className="text-[#8b5a2b] text-xl md:text-3xl">و</span><br/>
                زيتونة
              </h1>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-[#8b5a2b] text-xl md:text-2xl">🌿</span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#2c3e2c] tracking-wide">قائمة الطعام</h2>
              <span className="text-[#8b5a2b] text-xl md:text-2xl">🫒</span>
            </div>
            <p className="mt-3 text-[#6b7c6b] font-medium md:text-lg">طعم الأصالة في كل قضمة</p>
          </header>

          {/* Responsive Category Navigation */}
          <div className="mb-10 md:mb-16 relative">
            {/* Fade edges for mobile scrolling */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#fdfbf7] to-transparent z-10 md:hidden pointer-events-none"></div>
            <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-[#fdfbf7] to-transparent z-10 md:hidden pointer-events-none"></div>

            <nav className="flex overflow-x-auto hide-scrollbar justify-start md:justify-center items-center gap-2 md:gap-4 p-2 bg-[#f4f1ea]/70 rounded-2xl border border-[#e0d8c8] backdrop-blur-sm">
              <button 
                className={`flex-shrink-0 px-5 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${activeCategory === 'all' ? 'bg-[#2c3e2c] text-white shadow-lg scale-105' : 'text-[#6b7c6b] hover:bg-[#e0d8c8] hover:text-[#2c3e2c]'}`}
                onClick={() => setActiveCategory('all')}
              >
                الكل
              </button>
              {(Object.entries(menuData.categories) as [CategoryKey, Category][]).map(([key, category]) => (
                <button
                  key={key}
                  className={`flex-shrink-0 px-5 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${activeCategory === key ? 'bg-[#2c3e2c] text-white shadow-lg scale-105' : 'text-[#6b7c6b] hover:bg-[#e0d8c8] hover:text-[#2c3e2c]'}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {category.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Menu Content */}
          <main className="relative">
            {activeCategory === 'all' ? (
              // Masonry Style Grid on Desktop, Single Column on Mobile
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 items-start">
                {/* Column 1 */}
                <div className="flex flex-col">
                  <CategorySection categoryKey="sandwiches" category={menuData.categories.sandwiches} />
                  <CategorySection categoryKey="additions" category={menuData.categories.additions} />
                </div>
                {/* Column 2 - Offset visually on large screens for modern feel */}
                <div className="flex flex-col lg:mt-16">
                  <CategorySection categoryKey="lightMeals" category={menuData.categories.lightMeals} />
                  <CategorySection categoryKey="beverages" category={menuData.categories.beverages} />
                  <CategorySection categoryKey="desserts" category={menuData.categories.desserts} />
                </div>
              </div>
            ) : (
              // Single Category View
              <div className="max-w-3xl mx-auto">
                <CategorySection 
                  categoryKey={activeCategory} 
                  category={menuData.categories[activeCategory]} 
                />
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-[#d1c4a9] flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 bg-[#f4f1ea]/40 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-center gap-3 font-bold text-[#2c3e2c] bg-white px-6 py-3.5 rounded-full shadow-sm hover:shadow-md transition-shadow w-full md:w-auto">
              <span className="text-xl">📞</span>
              <span dir="ltr" className="tracking-wide">03 237 391</span>
            </div>
            <div className="flex items-center justify-center gap-3 font-bold text-[#2c3e2c] bg-white px-6 py-3.5 rounded-full shadow-sm hover:shadow-md transition-shadow w-full md:w-auto">
              <span className="text-xl">📍</span>
              <span>عين دارة، لبنان</span>
            </div>
          </footer>
          
        </div>
      </div>
    </div>
  );
};

export default Menu;