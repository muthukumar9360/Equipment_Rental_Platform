import React, { useRef, useEffect } from 'react';

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
const LocationsAndSearches = () => {
  const scrollRef = useRef(null);

  const rentalLocations = [
    { city: 'New York', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=200&q=80' },
    { city: 'Los Angeles', imageUrl: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=200&q=80' },
    { city: 'Chicago', imageUrl: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=200&q=80' },
    { city: 'Houston', imageUrl: 'https://images.unsplash.com/photo-1531218150217-5afc463f2538?auto=format&fit=crop&w=200&q=80' },
    { city: 'Phoenix', imageUrl: 'https://images.unsplash.com/photo-1513251703273-db987b50875e?auto=format&fit=crop&w=200&q=80' },
    { city: 'Miami', imageUrl: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=200&q=80' },
    { city: 'Atlanta', imageUrl: 'https://images.unsplash.com/photo-1533758277259-2162a87474a0?auto=format&fit=crop&w=200&q=80' },
    { city: 'Seattle', imageUrl: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=200&q=80' },
  ];

  const popularSearches = [
    { title: 'Cinema Cameras', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80' },
    { title: 'Heavy Duty Tractors', imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f29efc6657c?auto=format&fit=crop&w=300&q=80' },
    { title: 'Industrial Generators', imageUrl: 'https://images.unsplash.com/photo-1621503798950-c752672ccb64?auto=format&fit=crop&w=300&q=80' },
    { title: '4K Drones & UAVs', imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=300&q=80' },
    { title: 'Scaffolding Kits', imageUrl: 'https://images.unsplash.com/photo-1541888086225-ee59cb4a5723?auto=format&fit=crop&w=300&q=80' },
    { title: 'Audio & PA Systems', imageUrl: 'https://images.unsplash.com/photo-1516280440502-629ee921f005?auto=format&fit=crop&w=300&q=80' },
    { title: 'Party & Event Props', imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=300&q=80' },
    { title: 'Camping & Tents', imageUrl: 'https://images.unsplash.com/photo-1504280390226-f7823527a202?auto=format&fit=crop&w=300&q=80' },
  ];

  // Auto-scroll logic for top locations
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollStep = 250; 
    const interval = 2500; 

    const scrollInterval = setInterval(() => {
      if (!scrollContainer) return;

      scrollAmount += scrollStep;
      if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }
    }, interval);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <section className="my-8 max-w-full overflow-hidden">
      
      {/* Top Rental Locations Section */}
      <div className="mb-10 border border-black bg-gray-50 p-6 md:p-8 rounded-3xl shadow-sm relative">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          Top Rental Hubs
          <span className="bg-red-500 text-white text-[10px] md:text-xs px-2 py-1 rounded ml-3 font-bold uppercase">Trending</span>
        </h2>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto hide-scrollbar space-x-5 py-2"
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
            {popularSearches.map((search, index) => (
              <PopularSearchCard
                key={index}
                title={search.title}
                imageUrl={search.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default LocationsAndSearches;
