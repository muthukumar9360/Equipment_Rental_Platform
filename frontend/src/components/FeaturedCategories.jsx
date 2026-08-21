import React, { useState } from 'react';

const categories = [
  { id: 1, title: 'Cameras & Lenses', itemsCount: 45, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400' },
  { id: 2, title: 'Drones', itemsCount: 12, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400' },
  { id: 3, title: 'Audio Equipment', itemsCount: 28, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400' },
  { id: 4, title: 'Lighting', itemsCount: 34, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400' },
  { id: 5, title: 'Accessories', itemsCount: 81, image: 'https://images.unsplash.com/photo-1626244422285-a7741d40212a?auto=format&fit=crop&q=80&w=400' },
  { id: 6, title: 'Studio Gear', itemsCount: 19, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400' },
  { id: 7, title: 'Action Cameras', itemsCount: 22, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400' },
  { id: 8, title: 'Lenses Only', itemsCount: 56, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400' },
];

const FeaturedCategories = ({ onSelectCategory }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const topCategories = categories.slice(0, 4);

  const handleCategoryClick = (title) => {
    if (onSelectCategory) {
      onSelectCategory(title);
    }
    setShowAllCategories(false);
    // Scroll to the search section
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="mb-6 p-6 mt-12 rounded-3xl border-[1px] border-solid border-gray-900 bg-gradient-to-b from-gray-50/50 to-transparent relative shadow-md">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-2 bg-white border-[1px] border-solid border-gray-900 rounded-full text-black font-bold text-xl tracking-[0.2em] uppercase shadow-lg transform hover:scale-105 transition-transform">
        Featured
      </div>
      <div className="flex justify-between items-end mb-6 mt-1">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Explore Popular Categories <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2 align-middle">NEW</span></h3>
        </div>
        <div className="relative group inline-block">
          {/* Animated Glowing Aura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 animate-pulse transition duration-500"></div>
          
          <button 
            onClick={() => setShowAllCategories(true)}
            className="relative px-7 py-2.5 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer flex items-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              View All
            </span>
            <span className="ml-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topCategories.map(category => (
          <div 
            key={category.id} 
            onClick={() => handleCategoryClick(category.title)}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-72 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gray-900">
              <img src={category.image} alt={category.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex justify-between items-end mb-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center border border-white/20">
                  {category.itemsCount} Items
                </span>
              </div>
              <h4 className="font-bold text-xl text-white leading-tight mt-1">{category.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* All Categories Modal */}
      {showAllCategories && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all flex flex-col max-h-[85vh]">
            <div className="px-8 pt-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">All Categories</h3>
              </div>
              <button onClick={() => setShowAllCategories(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map(category => (
                  <div 
                    key={category.id} 
                    onClick={() => handleCategoryClick(category.title)}
                    className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-48 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gray-900">
                      <img src={category.image} alt={category.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                        {category.itemsCount} Items
                      </span>
                      <h4 className="font-bold text-lg text-white leading-tight">{category.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedCategories;
