import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickCategories = ({ products = [] }) => {
  const navigate = useNavigate();
  
  const categories = [
    { name: "Cameras", icon: "📷" },
    { name: "Generators", icon: "⚡" },
    { name: "Power Tools", icon: "🛠️" },
    { name: "Drones", icon: "🚁" },
    { name: "Audio Gear", icon: "🎧" },
    { name: "Agriculture", icon: "🚜" },
    { name: "Projectors", icon: "📽️" },
    { name: "Lighting", icon: "💡" },
    { name: "Vehicles", icon: "🚚" },
    { name: "Camping", icon: "⛺" },
    { name: "Medical", icon: "🦽" },
    { name: "Cleaning", icon: "🧹" },
    { name: "Laptops", icon: "💻" },
    { name: "Scaffolding", icon: "🪜" },
    { name: "Surveying", icon: "🔭" },
    { name: "Water Pumps", icon: "💧" },
    { name: "Party Props", icon: "🎈" },
    { name: "Gaming", icon: "🎮" },
    { name: "Bicycles", icon: "🚲" },
    { name: "Popular Items", icon: "🔥" },
  ];

  return (
    <div className="my-8 w-full bg-white py-8 border border-black rounded-3xl">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Quick Browse <span className="text-blue-600">Equipment</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {categories.map((cat, i) => {
            const count = products.filter(p => p.category === cat.name).length;
            
            return (
              <div
                key={i}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className="group flex flex-col items-center justify-center p-4 rounded-3xl bg-gray-50 hover:bg-gray-900 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border border-black hover:border-gray-800"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white shadow-sm group-hover:bg-gray-800 transition-colors duration-300 mb-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-700 text-center group-hover:text-white transition-colors duration-300">
                  {cat.name}
                </p>
                {count > 0 && (
                  <p className="text-[10px] text-gray-400 group-hover:text-gray-300 mt-1 font-semibold">
                    {count} {count === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickCategories;
