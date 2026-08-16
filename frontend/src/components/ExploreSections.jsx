import React, { useState, useEffect } from "react";

// --- Sample data for static sections ---
const dealsAndOffers = [
  // --- Banks & Financial ---
  "Kotak Mahindra Bank Offers",
  "HDFC Bank Credit Cards",
  "ICICI Bank No Cost EMI",
  "Axis Bank Rewards",
  "State Bank of India Offers",

  // --- Equipment Brands ---
  "Sony Alpha Deals",
  "Canon Lens Rentals",
  "DJI Drone Offers",
  "RED Digital Cinema",
  "Yamaha Generators",
  "Honda Power Equipment",
  "Makita Tools Sale",
  "DeWalt Special Offers",
  "Bosch Professional",

  // --- Event & Production ---
  "JBL Audio Packages",
  "Sennheiser Mics",
  "Rode Audio Offers",
  "Pioneer DJ Sets",
  "Shure Microphones",

  // --- Transport & Vehicles ---
  "Zoomcar Rentals",
  "Avis Car Rental",
  "Hertz Equipment",
  "U-Haul Truck Rentals",

  // --- Special Categories ---
  "Weekend Party Packages",
  "Filmmaking Bundles",
  "Construction Heavy Duty",
  "Camping Combo Deals",
  "Medical Gear Discounts"
];

// --- Category Tabs ---
const categoryTabs = [
  "Electronics & IT",
  "Photography & Filmmaking",
  "Audio & Event Gear",
  "Construction Tools",
  "Agricultural Machinery",
  "Power Generators",
  "Vehicles & Transport",
  "Camping & Outdoors",
  "Medical Equipment",
  "Cleaning Equipment",
];

// --- Main Component ---
const ExploreSections = () => {
  const [activeCategory, setActiveCategory] = useState("Electronics & IT");
  const [popularSearches, setPopularSearches] = useState([]);

  // Simulate fetching dynamic data
  useEffect(() => {
    const categoryData = {
      "Electronics & IT": [
        "Laptops", "Desktops", "Tablets", "Monitors", "Printers", "Servers", "Networking Gear", "Projectors", "VR Headsets", "Gaming Consoles"
      ],
      "Photography & Filmmaking": [
        "DSLR Cameras", "Mirrorless Cameras", "Cinema Cameras", "Drones", "Tripods & Gimbal", "Lenses", "Lighting Equipment", "Action Cameras", "Studio Backdrops"
      ],
      "Audio & Event Gear": [
        "PA Systems", "Microphones", "DJ Mixers", "Stage Lighting", "Fog Machines", "Speakers", "Audio Interfaces", "Amplifiers", "Podiums"
      ],
      "Construction Tools": [
        "Concrete Mixers", "Jackhammers", "Scaffolding", "Ladders", "Power Drills", "Saws", "Generators", "Excavators", "Earth Movers", "Surveying Equipment"
      ],
      "Agricultural Machinery": [
        "Tractors", "Harvesters", "Cultivators", "Water Pumps", "Sprayers", "Tillers", "Chainsaws", "Plows", "Seeders"
      ],
      "Power Generators": [
        "Portable Generators", "Inverter Generators", "Industrial Generators", "Solar Panels", "Battery Banks", "Power Stations"
      ],
      "Vehicles & Transport": [
        "Trucks", "Vans", "Trailers", "Forklifts", "Bicycles", "Scooters", "Cars", "Golf Carts"
      ],
      "Camping & Outdoors": [
        "Tents", "Sleeping Bags", "Camping Stoves", "Kayaks", "Bicycles", "Backpacks", "Portable Grills", "Coolers"
      ],
      "Medical Equipment": [
        "Wheelchairs", "Hospital Beds", "Oxygen Concentrators", "CPAP Machines", "Mobility Scooters", "Walkers", "Crutches"
      ],
      "Cleaning Equipment": [
        "Pressure Washers", "Industrial Vacuums", "Floor Scrubbers", "Carpet Cleaners", "Steam Cleaners", "Leaf Blowers"
      ]
    };

    setPopularSearches(categoryData[activeCategory] || []);
  }, [activeCategory]);

  return (
    <section className="px-6 bg-white text-gray-800 py-3 rounded-3xl border border-black w-full mb-8">
      {/* --- Popular Categories --- */}
      <div className="mb-2 mt-3">
        <h2 className="text-2xl font-extrabold mb-4 text-gray-900 border-b border-gray-200 inline-block">Popular Categories</h2>

        {/* Tabs - Scrollable horizontally */}
        <div className="overflow-x-auto whitespace-nowrap mb-3 pb-2 hide-scrollbar">
          <div className="inline-flex gap-3">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 shrink-0 ${
                  activeCategory === tab
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Category Links */}
        <div className="text-sm leading-relaxed flex flex-wrap gap-x-3 gap-y-2 mb-5">
          {popularSearches.map((item, index) => (
            <div key={index} className="flex items-center">
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item}
              </a>
              {index < popularSearches.length - 1 && <span className="text-gray-300 ml-3">|</span>}
            </div>
          ))}
        </div>
      </div>

      {/* --- Trending Searches --- */}
      <div className="mb-3">
        <h2 className="text-2xl font-extrabold mb-1 text-gray-900 border-b border-gray-200 pb-2 inline-block">Trending Searches</h2>
        <div className="text-sm flex flex-wrap gap-x-3 gap-y-2 leading-relaxed">
          {[
            "Rent Sony A7SIII",
            "DJI Mavic 3 Pro Rental",
            "Canon Lens Rental Near Me",
            "Red Komodo Cinema Camera",
            "Honda 2000W Generator",
            "Party Speaker System Rent",
            "Heavy Duty Jackhammers",
            "Scaffolding Rental NY",
            "Camping Tent 4 Person",
            "Wheelchair Rental",
            "Industrial Carpet Cleaner",
            "MacBook Pro Rental",
            "VR Headset Rental",
            "Wedding Photography Gear",
            "DJ Mixer Pioneer",
            "Wireless Microphones Rent",
            "Tractor Rental Near Me",
            "Portable Solar Panels",
            "Cargo Van Rental",
            "Electric Scooter Rent",
            "Oxygen Concentrator Hire",
            "Pressure Washer Commercial",
            "Gaming Console Rentals",
            "Studio Lighting Kit",
            "Gimbal Stabilizer Rent"
          ]
            .sort()
            .map((item, index, arr) => (
              <div key={index} className="flex items-center">
                <a
                  href="#"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  {item}
                </a>
                {index < arr.length - 1 && <span className="text-gray-300 ml-3">|</span>}
              </div>
            ))}
        </div>
      </div>

      {/* --- Deals and Offers --- */}
      <div className="mb-3">
        <h2 className="text-2xl font-extrabold mb-1 text-gray-900 border-b border-gray-200 pb-2 inline-block">Deals and Offers</h2>
        <div className="text-sm flex flex-wrap gap-x-3 gap-y-2 leading-relaxed">
          {dealsAndOffers.map((item, index) => (
            <div key={index} className="flex items-center">
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item}
              </a>
              {index < dealsAndOffers.length - 1 && <span className="text-gray-300 ml-3">|</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreSections;
