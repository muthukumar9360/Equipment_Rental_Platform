import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import FeaturedCategories from '../components/FeaturedCategories';
import QuickCategories from '../components/QuickCategories';
import HeroShowcase from '../components/HeroShowcase';
import { EquiporaFeatureShowcases } from '../components/FeatureShowcase';
import MobileAppBanner from '../components/MobileAppBanner';
import ExploreSections from '../components/ExploreSections';
import LocationsAndSearches from '../components/LocationsAndSearches';
import CategoryShowcase from '../components/CategoryShowcase';

const Marketplace = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationViewMode, setLocationViewMode] = useState('district'); // 'district' | 'area'
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [isModalBrandOpen, setIsModalBrandOpen] = useState(false);
  const [isModalStatusOpen, setIsModalStatusOpen] = useState(false);

  const [maxPrice, setMaxPrice] = useState(1000);
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [minConditionScore, setMinConditionScore] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const [tempMaxPrice, setTempMaxPrice] = useState(10000);
  const [tempMinTrustScore, setTempMinTrustScore] = useState(0);
  const [tempMinConditionScore, setTempMinConditionScore] = useState(0);
  const [tempSelectedBrand, setTempSelectedBrand] = useState('');
  const [tempVerificationStatus, setTempVerificationStatus] = useState('');
  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching marketplace products', error);
      }
    };
    fetchProducts();
  }, []);

  // Hardcoded for now to match UI
  const categories = ["Cameras", "Drones", "Audio Gear", "Power Tools", "Lighting", "Vehicles"];
  const brands = ["Sony", "Canon", "DJI", "DeWalt", "Makita", "Rode", "Shure"];
  const subCategoriesMap = {
    "Cameras": ["DSLR", "Mirrorless", "Cinema", "Action Cams", "360 Cameras"],
    "Drones": ["Photography", "FPV Racing", "Enterprise", "Underwater"],
    "Audio Gear": ["Microphones", "Mixers", "Speakers", "Recorders"],
    "Power Tools": ["Drills", "Saws", "Generators", "Sanders", "Compressors"],
    "Lighting": ["Continuous", "Strobes", "Modifiers", "Stands"],
    "Vehicles": ["Vans", "Trucks", "Trailers", "ATVs"]
  };
  const locations = [
    "Tirunelveli - Sankarnagar", "Tirunelveli - Karungulam", "Tirunelveli - Palayamkottai", "Tirunelveli - Town",
    "Chennai - Anna Nagar", "Chennai - T Nagar", "Chennai - Velachery",
    "Madurai - K.K. Nagar", "Madurai - Anna Nagar",
    "Coimbatore - Gandhipuram", "Coimbatore - RS Puram",
    "Trichy - Srirangam", "Trichy - Thillai Nagar"
  ];

  const groupedLocations = locations.reduce((acc, loc) => {
    const [district, area] = loc.split(' - ');
    if (district && area) {
      if (!acc[district]) acc[district] = [];
      acc[district].push({ full: loc, area });
    }
    return acc;
  }, {});

  const openFilters = () => {
    setTempMaxPrice(maxPrice);
    setTempMinTrustScore(minTrustScore);
    setTempMinConditionScore(minConditionScore);
    setTempSelectedBrand(selectedBrand);
    setTempVerificationStatus(verificationStatus);
    setShowFiltersModal(true);
  };

  const applyFilters = () => {
    setMaxPrice(tempMaxPrice);
    setMinTrustScore(tempMinTrustScore);
    setMinConditionScore(tempMinConditionScore);
    setSelectedBrand(tempSelectedBrand);
    setVerificationStatus(tempVerificationStatus);
    setShowFiltersModal(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
    if (selectedLocation) params.append('location', selectedLocation);
    if (maxPrice < 1000) params.append('maxPrice', maxPrice);
    if (minTrustScore > 0) params.append('minTrustScore', minTrustScore);
    if (minConditionScore > 0) params.append('minConditionScore', minConditionScore);
    if (selectedBrand) params.append('brand', selectedBrand);
    if (verificationStatus) params.append('verification', verificationStatus);
    
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div className="pb-0">
      {/* Search Bar Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center z-40 relative border border-black">
        <div className="w-full lg:flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search equipment by name or brand..." 
            className="w-full pl-11 pr-4 py-3.5 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all font-medium text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Custom Category Dropdown */}
        <div className="w-full lg:w-48 relative">
          <button 
            type="button"
            className="w-full flex items-center justify-between px-4 py-3.5 border border-black rounded-xl bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left"
            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsSubCategoryOpen(false); setIsLocationOpen(false); }}
          >
            <div className="flex items-center truncate">
              <span className="p-1 bg-blue-50 text-blue-600 rounded-md mr-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
              </span>
              <span className="font-medium text-gray-700 truncate">{selectedCategory || 'Category'}</span>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isCategoryOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none">
              <ul className="py-1">
                <li 
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm font-medium ${!selectedCategory ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                  onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setIsCategoryOpen(false); }}
                >
                  All Categories
                </li>
                {categories.map(cat => (
                  <li 
                    key={cat}
                    className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm font-medium ${selectedCategory === cat ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                    onClick={() => { setSelectedCategory(cat); setSelectedSubCategory(''); setIsCategoryOpen(false); }}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Custom SubCategory Dropdown */}
        <div className="w-full lg:w-48 relative">
          <button 
            type="button"
            className={`w-full flex items-center justify-between px-4 py-3.5 border border-black rounded-xl bg-white shadow-sm transition-all text-left ${!selectedCategory ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
            onClick={() => { 
              if (selectedCategory) {
                setIsSubCategoryOpen(!isSubCategoryOpen); 
                setIsCategoryOpen(false); 
                setIsLocationOpen(false); 
              }
            }}
            disabled={!selectedCategory}
          >
            <div className="flex items-center truncate">
              <span className={`p-1 rounded-md mr-3 ${selectedCategory ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
              </span>
              <span className="font-medium text-gray-700 truncate">{selectedSubCategory || 'Subcategory'}</span>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isSubCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isSubCategoryOpen && selectedCategory && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none">
              <ul className="py-1">
                <li 
                  className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 text-sm font-medium ${!selectedSubCategory ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}
                  onClick={() => { setSelectedSubCategory(''); setIsSubCategoryOpen(false); }}
                >
                  All in {selectedCategory}
                </li>
                {subCategoriesMap[selectedCategory]?.map(sub => (
                  <li 
                    key={sub}
                    className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 text-sm font-medium ${selectedSubCategory === sub ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}
                    onClick={() => { setSelectedSubCategory(sub); setIsSubCategoryOpen(false); }}
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Custom Location Dropdown */}
        <div className="w-full lg:w-48 relative">
          <button 
            type="button"
            className="w-full flex items-center justify-between px-4 py-3.5 border border-black rounded-xl bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left"
            onClick={() => { 
              setIsLocationOpen(!isLocationOpen); 
              setIsCategoryOpen(false); 
              setIsSubCategoryOpen(false); 
              if (!isLocationOpen) { setLocationViewMode('district'); setActiveDistrict(null); }
            }}
          >
            <div className="flex items-center truncate">
              <span className="p-1 bg-red-50 text-red-500 rounded-md mr-3 shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              </span>
              <span className="font-medium text-gray-700 truncate">{selectedLocation ? selectedLocation.split(' - ')[1] : 'Location'}</span>
            </div>
            <svg className={`w-5 h-5 shrink-0 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isLocationOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-72 overflow-auto focus:outline-none">
              <ul className="py-1">
                {locationViewMode === 'district' ? (
                  <>
                    <li 
                      className={`px-4 py-3 cursor-pointer hover:bg-red-50 text-sm font-medium ${!selectedLocation ? 'text-red-600 bg-red-50/50' : 'text-gray-700'}`}
                      onClick={() => { setSelectedLocation(''); setIsLocationOpen(false); }}
                    >
                      All Locations
                    </li>
                    {Object.keys(groupedLocations).map(district => (
                      <li 
                        key={district}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 flex justify-between items-center"
                        onClick={() => { setActiveDistrict(district); setLocationViewMode('area'); }}
                      >
                        {district}
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </li>
                    ))}
                  </>
                ) : (
                  <>
                    <li 
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm font-bold text-gray-900 border-b border-gray-100 flex items-center bg-gray-50"
                      onClick={() => { setLocationViewMode('district'); }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                      {activeDistrict}
                    </li>
                    {groupedLocations[activeDistrict]?.map(locObj => (
                      <li 
                        key={locObj.full}
                        className={`px-4 py-3 cursor-pointer hover:bg-red-50 text-sm font-medium ${selectedLocation === locObj.full ? 'text-red-600 bg-red-50/50' : 'text-gray-700 pl-8'}`}
                        onClick={() => { setSelectedLocation(locObj.full); setIsLocationOpen(false); }}
                      >
                        {locObj.area}
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex w-full lg:w-auto space-x-2">
          <button 
            onClick={openFilters}
            className="flex-1 lg:flex-none px-4 py-3.5 bg-gray-900 border border-transparent text-white font-medium rounded-xl hover:bg-blue-600 flex items-center justify-center shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            <span className="hidden lg:inline">Filters</span>
          </button>
          <button 
            onClick={handleSearch}
            className="flex-1 lg:flex-none px-8 py-3.5 bg-blue-600 border border-transparent text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center shadow-md transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      <div className="text-center mt-6 mb-6">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Trust-First Equipment Rental
        </h2>
        <p className="text-lg text-blue-500 max-w-3xl mx-auto">
          Rent high-quality gear with confidence. Verified users, guaranteed condition, and secure process.
        </p>
      </div>

      {/* More Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-xl font-bold text-gray-900">Advanced Filters</h3>
              <button onClick={() => setShowFiltersModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-50">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <button 
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                    onClick={() => { setIsModalBrandOpen(!isModalBrandOpen); setIsModalStatusOpen(false); }}
                  >
                    <span className="font-medium text-gray-700 truncate">{tempSelectedBrand || 'All Brands'}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isModalBrandOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isModalBrandOpen && (
                    <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                      <ul className="py-1">
                        <li 
                          className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${!tempSelectedBrand ? 'text-blue-600 bg-blue-50/50 font-semibold' : 'text-gray-700'}`}
                          onClick={() => { setTempSelectedBrand(''); setIsModalBrandOpen(false); }}
                        >
                          All Brands
                        </li>
                        {brands.map(brand => (
                          <li 
                            key={brand}
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${tempSelectedBrand === brand ? 'text-blue-600 bg-blue-50/50 font-semibold' : 'text-gray-700'}`}
                            onClick={() => { setTempSelectedBrand(brand); setIsModalBrandOpen(false); }}
                          >
                            {brand}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <button 
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                    onClick={() => { setIsModalStatusOpen(!isModalStatusOpen); setIsModalBrandOpen(false); }}
                  >
                    <span className="font-medium text-gray-700 truncate">
                      {tempVerificationStatus === 'Verified' ? 'Verified Only' : tempVerificationStatus === 'Pending' ? 'Pending Verification' : 'Any Status'}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isModalStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isModalStatusOpen && (
                    <div className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      <ul className="py-1">
                        {[
                          { label: 'Any Status', value: '' },
                          { label: 'Verified Only', value: 'Verified' },
                          { label: 'Pending Verification', value: 'Pending' }
                        ].map(status => (
                          <li 
                            key={status.value}
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${tempVerificationStatus === status.value ? 'text-blue-600 bg-blue-50/50 font-semibold' : 'text-gray-700'}`}
                            onClick={() => { setTempVerificationStatus(status.value); setIsModalStatusOpen(false); }}
                          >
                            {status.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Max Price Per Day</label>
                  <span className="text-sm font-bold text-blue-600">₹{tempMaxPrice}</span>
                </div>
                <input 
                  type="range" min="500" max="10000" step="100"
                  value={tempMaxPrice} onChange={(e) => setTempMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Minimum Trust Score</label>
                  <span className="text-sm font-bold text-green-600">{tempMinTrustScore} / 100</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={tempMinTrustScore} onChange={(e) => setTempMinTrustScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Minimum Condition Score</label>
                  <span className="text-sm font-bold text-indigo-600">{tempMinConditionScore} / 100</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={tempMinConditionScore} onChange={(e) => setTempMinConditionScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowFiltersModal(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <HeroShowcase products={products} />

      <FeaturedCategories onSelectCategory={(cat) => navigate(`/products?category=${encodeURIComponent(cat)}`)} />

      <CategoryShowcase />

      <QuickCategories products={products} />


      <EquiporaFeatureShowcases />

      <LocationsAndSearches products={products} />

      <ExploreSections />

      <MobileAppBanner />
    </div>
  );
};

export default Marketplace;
