import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CategoryShowcase = () => {
  const navigate = useNavigate();

  // Hardcoded Categories and Subcategories to match UI design
  const showcaseData = [
    {
      id: "cameras",
      mainCategory: "Cameras",
      mainImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600",
      subCategories: [
        { title: "DSLR", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400" },
        { title: "Mirrorless", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400" },
        { title: "Cinema", image: "https://images.unsplash.com/photo-1589808381861-c85d77443834?auto=format&fit=crop&q=80&w=400" },
        { title: "Action Cams", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400" },
        { title: "360 Cameras", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400" },
      ]
    },
    {
      id: "drones",
      mainCategory: "Drones",
      mainImage: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=600",
      subCategories: [
        { title: "Photography", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400" },
        { title: "FPV Racing", image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=400" },
        { title: "Enterprise", image: "https://images.unsplash.com/photo-1524143986875-3b098d78b363?auto=format&fit=crop&q=80&w=400" },
        { title: "Underwater", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400" },
      ]
    },
    {
      id: "tools",
      mainCategory: "Power Tools",
      mainImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600",
      subCategories: [
        { title: "Drills", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400" },
        { title: "Saws", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=400" },
        { title: "Generators", image: "https://images.unsplash.com/photo-1621503798950-c752672ccb64?auto=format&fit=crop&q=80&w=400" },
        { title: "Sanders", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400" },
        { title: "Compressors", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=400" },
      ]
    },
    {
      id: "audio",
      mainCategory: "Audio Gear",
      mainImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
      subCategories: [
        { title: "Microphones", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400" },
        { title: "Mixers", image: "https://images.unsplash.com/photo-1516280440502-629ee921f005?auto=format&fit=crop&q=80&w=400" },
        { title: "Speakers", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=400" },
        { title: "Recorders", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400" },
      ]
    },
    {
      id: "lighting",
      mainCategory: "Lighting",
      mainImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=600",
      subCategories: [
        { title: "Continuous", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400" },
        { title: "Strobes", image: "https://images.unsplash.com/photo-1521500647898-757022a1cefb?auto=format&fit=crop&q=80&w=400" },
        { title: "Modifiers", image: "https://images.unsplash.com/photo-1533757705141-8e055f10672e?auto=format&fit=crop&q=80&w=400" },
        { title: "Stands", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400" },
      ]
    },
    {
      id: "vehicles",
      mainCategory: "Vehicles",
      mainImage: "https://images.unsplash.com/photo-1579977823869-7809a4c03b12?auto=format&fit=crop&q=80&w=600",
      subCategories: [
        { title: "Vans", image: "https://images.unsplash.com/photo-1579977823869-7809a4c03b12?auto=format&fit=crop&q=80&w=400" },
        { title: "Trucks", image: "https://images.unsplash.com/photo-1586191582236-0275de1c8d55?auto=format&fit=crop&q=80&w=400" },
        { title: "Trailers", image: "https://images.unsplash.com/photo-1563212001-eb403063fc23?auto=format&fit=crop&q=80&w=400" },
        { title: "ATVs", image: "https://images.unsplash.com/photo-1579977823869-7809a4c03b12?auto=format&fit=crop&q=80&w=400" },
      ]
    },
  ];

  const [showAllModal, setShowAllModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [modalActiveMainCategory, setModalActiveMainCategory] = useState(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showAllModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAllModal]);

  const handleSubClick = (mainCategory, subCategoryTitle) => {
    // Navigate to the equipment page and filter by the main category and subcategory
    navigate(`/equipment?category=${encodeURIComponent(mainCategory)}&subCategory=${encodeURIComponent(subCategoryTitle)}`);
    setShowAllModal(false);
  };

  const handleViewAll = () => {
    setShowAllModal(true);
    setModalSearchTerm("");
    setModalActiveMainCategory(null);
  };

  // Process data for the modal based on step
  let displayedItems = [];
  if (showAllModal) {
    if (!modalActiveMainCategory) {
      // Step 1: Show Main Categories
      if (modalSearchTerm.trim() === "") {
        displayedItems = showcaseData;
      } else {
        displayedItems = showcaseData.filter(cat => 
          cat.mainCategory.toLowerCase().includes(modalSearchTerm.toLowerCase())
        );
      }
    } else {
      // Step 2: Show Subcategories for selected main category
      if (modalSearchTerm.trim() === "") {
        displayedItems = modalActiveMainCategory.subCategories;
      } else {
        displayedItems = modalActiveMainCategory.subCategories.filter(sub => 
          sub.title.toLowerCase().includes(modalSearchTerm.toLowerCase())
        );
      }
    }
  }

  return (
    <div className="py-2 relative w-full">
      {/* View All Button */}
      <div className="flex justify-between mb-6">
        <p className="underline decoration-blue-600 decoration-5 font-bold text-3xl">Available Equipments</p>
        <div className="relative group inline-block">
          {/* Animated Glowing Aura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-100 animate-pulse transition duration-500"></div>
          
          <button
            onClick={handleViewAll}
            className="relative px-7 py-3 bg-white border border-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              View All Categories and SubCategories
            </span>
            <span className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </span>
          </button>
        </div>
      </div>

      {/* Display first 4 categories with 3 subcategories each (Original Homepage UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {showcaseData.slice(0, 4).map((cat) => (
          <div
            key={cat.id}
            className="rounded-3xl border-black border bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-black mb-6 text-center text-gray-900 border-b border-gray-100 pb-3">
              {cat.mainCategory}
            </h2>

            <div className="grid grid-cols-3 gap-4 mt-3">
              {/* Only show first 3 subcategories */}
              {cat.subCategories.slice(0, 3).map((sub, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.03] hover:-translate-y-1 transition-all cursor-pointer group bg-gray-50 border border-gray-100"
                  onClick={() => handleSubClick(cat.mainCategory, sub.title)}
                >
                  <div className="w-full h-32 overflow-hidden bg-gray-200">
                    <img
                      src={sub.image}
                      alt={sub.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-2 bg-gray-900 text-white">
                    <h3 className="text-sm font-bold text-center group-hover:text-blue-400 transition-colors">
                      {sub.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal with Subcategories and Search (New UI) */}
      {showAllModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 md:p-10">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden transform transition-all flex flex-col max-h-full md:max-h-[85vh]">
            
            {/* Modal Header & Search Bar */}
            <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
              <div className="flex items-center space-x-3">
                {modalActiveMainCategory && (
                  <button 
                    onClick={() => { setModalActiveMainCategory(null); setModalSearchTerm(""); }}
                    className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors shrink-0"
                    title="Back to All Categories"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  </button>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {modalActiveMainCategory 
                      ? `${modalActiveMainCategory.mainCategory} Subcategories`
                      : 'All Categories'
                    }
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {modalActiveMainCategory 
                      ? 'Select a subcategory to browse available equipment'
                      : 'Select a main category first'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 w-full md:w-1/2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder={modalActiveMainCategory ? `Search in ${modalActiveMainCategory.mainCategory}...` : "Search categories..."} 
                    className="w-full pl-10 pr-4 py-3 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={() => setShowAllModal(false)} 
                  className="p-3 bg-gray-100 rounded-xl text-gray-500 hover:text-white hover:bg-red-500 transition-colors shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body - Displayed Items */}
            <div className="p-8 overflow-y-auto bg-gray-50/50 flex-1">
              {displayedItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">No results found matching "{modalSearchTerm}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {!modalActiveMainCategory ? (
                    // Step 1: Render Main Categories
                    displayedItems.map((cat, index) => (
                      <div
                        key={cat.id || index}
                        className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-black h-48"
                        onClick={() => { setModalActiveMainCategory(cat); setModalSearchTerm(""); }}
                      >
                        <div className="absolute inset-0 bg-gray-900">
                          <img
                            src={cat.mainImage}
                            alt={cat.mainCategory}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center justify-end">
                          <h3 className="text-xl font-black text-white text-center leading-tight mb-2">
                            {cat.mainCategory}
                          </h3>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Step 2: Render Subcategories
                    displayedItems.map((sub, index) => (
                      <div
                        key={index}
                        className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 transition-all cursor-pointer group bg-white border border-gray-200 flex flex-col"
                        onClick={() => handleSubClick(modalActiveMainCategory.mainCategory, sub.title)}
                      >
                        <div className="w-full h-40 overflow-hidden bg-gray-200 relative">
                          <img
                            src={sub.image}
                            alt={sub.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
                        </div>
                        <div className="p-4 bg-white text-center flex-1 flex flex-col justify-center">
                          <h5 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {sub.title}
                          </h5>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                            in {modalActiveMainCategory.mainCategory}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryShowcase;
