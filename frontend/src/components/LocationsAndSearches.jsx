import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Top Rental Location Card ---
const LocationCard = ({ city, imageUrl }) => {
  return (
    <div
      className="
        w-52 flex-shrink-0
        border border-black rounded-xl bg-white
        shadow-sm hover:shadow-lg
        overflow-hidden
        transition-all duration-300
        hover:-translate-y-1
        cursor-pointer
      "
    >
      <div className="flex items-center p-3">
        {/* Image (Left Side) */}
        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden group relative">
          <img
            src={imageUrl}
            alt={city}
            className="
              w-full h-full object-cover
              transform transition-transform duration-500
              group-hover:scale-110
            "
          />
        </div>

        {/* Text (Right Side) */}
        <div className="ml-4 flex flex-col justify-center">
          <p className="text-md font-bold text-gray-900 truncate">{city}</p>
          <a
            href="#"
            className="text-xs text-blue-600 font-semibold hover:underline mt-0.5"
          >
            Explore Gear
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Popular Equipment Search Card ---
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

// --- Main Component Section ---
const LocationsAndSearches = ({ products = [] }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const rentalLocations = [
    { city: 'Chennai', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=200&q=80' },
    { city: 'Coimbatore', imageUrl: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=200&q=80' },
    { city: 'Madurai', imageUrl: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=200&q=80' },
    { city: 'Trichy', imageUrl: 'https://images.unsplash.com/photo-1531218150217-5afc463f2538?auto=format&fit=crop&w=200&q=80' },
    { city: 'Salem', imageUrl: 'https://images.unsplash.com/photo-1513251703273-db987b50875e?auto=format&fit=crop&w=200&q=80' },
    { city: 'Tirunelveli', imageUrl: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=200&q=80' },
    { city: 'Erode', imageUrl: 'https://images.unsplash.com/photo-1533758277259-2162a87474a0?auto=format&fit=crop&w=200&q=80' },
    { city: 'Vellore', imageUrl: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=200&q=80' },
    { city: 'Tiruppur', imageUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=200&q=80' },
    { city: 'Thoothukudi', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80' },
    { city: 'Thanjavur', imageUrl: 'https://images.unsplash.com/photo-1623860070500-47b2c0f64c67?auto=format&fit=crop&w=200&q=80' },
    { city: 'Dindigul', imageUrl: 'https://images.unsplash.com/photo-1596422846543-74c6f4c330e7?auto=format&fit=crop&w=200&q=80' },
    { city: 'Karur', imageUrl: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=200&q=80' },
    { city: 'Nagercoil', imageUrl: 'https://images.unsplash.com/photo-1570776775619-74d393de520e?auto=format&fit=crop&w=200&q=80' },
    { city: 'Kanchipuram', imageUrl: 'https://images.unsplash.com/photo-1598463953744-93ff5d8fa2eb?auto=format&fit=crop&w=200&q=80' },
    { city: 'Kumbakonam', imageUrl: 'https://images.unsplash.com/photo-1593368297610-d02324f6050b?auto=format&fit=crop&w=200&q=80' },
    { city: 'Rajapalayam', imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=200&q=80' },
    { city: 'Pudukkottai', imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=200&q=80' },
    { city: 'Hosur', imageUrl: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=200&q=80' },
    { city: 'Cuddalore', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80' },
  ];

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

  // Removed auto-scroll logic as requested. Scrolling is now completely manual.

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="my-8 max-w-full overflow-hidden">
      
      {/* Top Rental Locations Section */}
      <div className="mb-10 border border-black bg-gray-50 p-6 md:p-8 rounded-3xl shadow-sm relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center">
            Top Rental Hubs
            <span className="bg-red-500 text-white text-[10px] md:text-xs px-2 py-1 rounded ml-3 font-bold uppercase">Trending</span>
          </h2>
          
          {/* Scroll Arrows */}
          <div className="flex space-x-2">
            <button 
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={scrollRight}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-hidden space-x-7 py-2"
          >
            {rentalLocations.map((place, index) => (
              <LocationCard
                key={index}
                city={place.city}
                imageUrl={place.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Popular Equipment Searches Section */}
      <div className="mb-3">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 px-2 border-b border-gray-200 pb-2 inline-block">
          Most Searched Gear
        </h2>

        <div className="relative">
          <div className="flex overflow-x-auto space-x-5 py-4 px-2">
            {dynamicSearches.map((search, index) => (
              <div key={search._id || index} onClick={() => search._id && navigate(`/products/${search._id}`)}>
                <PopularSearchCard
                  title={search.name}
                  imageUrl={search.images?.[0] || 'https://via.placeholder.com/400'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default LocationsAndSearches;
