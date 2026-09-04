import React from 'react';
import { useNavigate } from 'react-router-dom';

const PopularSearchCard = ({ title, imageUrl }) => {
  return (
    <div className="w-44 sm:w-48 md:w-56 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="h-40 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="bg-gray-900 p-4 text-white border-t-2 border-blue-600">
        <p className="text-sm font-bold leading-tight mb-3 truncate">
          {title}
        </p>
        <button className="w-full bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-blue-500 transition duration-150">
          Browse Items
        </button>
      </div>
    </div>
  );
};

const MostSearchedGear = ({ products = [] }) => {
  const navigate = useNavigate();

  // Generate top searches dynamically from highest price products
  const dynamicSearches = products.length > 0 
    ? [...products].sort((a, b) => b.pricePerDay - a.pricePerDay).slice(0, 8)
    : [
        { name: 'Cinema Cameras', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80'] },
        { name: 'Heavy Duty Tractors', images: ['https://images.unsplash.com/photo-1592982537447-6f29efc6657c?auto=format&fit=crop&w=300&q=80'] },
        { name: 'Industrial Generators', images: ['https://images.unsplash.com/photo-1621503798950-c752672ccb64?auto=format&fit=crop&w=300&q=80'] },
        { name: '4K Drones & UAVs', images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=300&q=80'] },
        { name: 'Scaffolding Kits', images: ['https://images.unsplash.com/photo-1541888086225-ee59cb4a5723?auto=format&fit=crop&w=300&q=80'] },
        { name: 'Audio & PA Systems', images: ['https://images.unsplash.com/photo-1516280440502-629ee921f005?auto=format&fit=crop&w=300&q=80'] },
        { name: 'Party & Event Props', images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=300&q=80'] },
        { name: 'Camping & Tents', images: ['https://images.unsplash.com/photo-1504280390226-f7823527a202?auto=format&fit=crop&w=300&q=80'] }
      ];

  return (
    <section className="my-8 max-w-full overflow-hidden">
      <div className="mb-3">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 px-2 border-b border-gray-200 pb-2 inline-block">
          Most Searched Gear
        </h2>

        <div className="relative">
          <div className="flex overflow-x-auto space-x-5 py-4 px-2 custom-scrollbar">
            {dynamicSearches.map((search, index) => (
              <div key={search._id || index} onClick={() => search._id && navigate(`/products/${search._id}`)}>
                <PopularSearchCard
                  title={search.name}
                  imageUrl={search.images?.[0] || search.images?.[0] || 'https://via.placeholder.com/400'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MostSearchedGear;
