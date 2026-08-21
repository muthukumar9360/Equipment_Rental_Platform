import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || '';
  const initialSubCategory = queryParams.get('subCategory') || '';

  const initialMaxPrice = Number(queryParams.get('maxPrice')) || 1000;
  const initialMinTrustScore = Number(queryParams.get('minTrustScore')) || 0;
  const initialMinConditionScore = Number(queryParams.get('minConditionScore')) || 0;
  const initialBrand = queryParams.get('brand') || '';
  const initialVerification = queryParams.get('verification') || '';
  const initialLocation = queryParams.get('location') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCategory);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationViewMode, setLocationViewMode] = useState('district'); // 'district' | 'area'
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [isModalBrandOpen, setIsModalBrandOpen] = useState(false);
  const [isModalStatusOpen, setIsModalStatusOpen] = useState(false);

  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [minTrustScore, setMinTrustScore] = useState(initialMinTrustScore);
  const [minConditionScore, setMinConditionScore] = useState(initialMinConditionScore);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [verificationStatus, setVerificationStatus] = useState(initialVerification);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  const [tempMaxPrice, setTempMaxPrice] = useState(initialMaxPrice);
  const [tempMinTrustScore, setTempMinTrustScore] = useState(initialMinTrustScore);
  const [tempMinConditionScore, setTempMinConditionScore] = useState(initialMinConditionScore);
  const [tempSelectedBrand, setTempSelectedBrand] = useState(initialBrand);
  const [tempVerificationStatus, setTempVerificationStatus] = useState(initialVerification);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, selectedCategory, selectedSubCategory, selectedLocation, maxPrice, minTrustScore, minConditionScore, selectedBrand, verificationStatus]);

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
    setAppliedSearchTerm(searchTerm);
    // You can optionally update the URL here to make it shareable
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading equipment...</div>;

  const categories = [...new Set(products.map(p => p.category))].sort();
  const locations = [...new Set(products.map(p => p.location).filter(Boolean))].sort();
  const groupedLocations = locations.reduce((acc, loc) => {
    const [district, area] = loc.split(' - ');
    if (district && area) {
      if (!acc[district]) acc[district] = [];
      acc[district].push({ full: loc, area });
    }
    return acc;
  }, {});
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

  const subCategoriesMap = {
    "Cameras": ["DSLR", "Mirrorless", "Cinema", "Action Cams", "360 Cameras"],
    "Drones": ["Photography", "FPV Racing", "Enterprise", "Underwater"],
    "Audio Gear": ["Microphones", "Mixers", "Speakers", "Recorders"],
    "Power Tools": ["Drills", "Saws", "Generators", "Sanders", "Compressors"],
    "Lighting": ["Continuous", "Strobes", "Modifiers", "Stands"],
    "Vehicles": ["Vans", "Trucks", "Trailers", "ATVs"]
  };

  const filteredProducts = products.filter(product => {
    const searchLower = appliedSearchTerm.toLowerCase();
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchLower) || 
                          (product.brand?.toLowerCase() || '').includes(searchLower);
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSubCategory = selectedSubCategory ? product.subCategory === selectedSubCategory : true;
    const matchesLocation = selectedLocation ? product.location === selectedLocation : true;
    const matchesPrice = product.pricePerDay <= maxPrice;
    const matchesTrust = product.trustScore >= minTrustScore;
    const matchesCondition = product.conditionScore >= minConditionScore;
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    const matchesVerification = verificationStatus ? product.verificationStatus === verificationStatus : true;
    
    return matchesSearch && matchesCategory && matchesSubCategory && matchesLocation && matchesPrice && 
           matchesTrust && matchesCondition && matchesBrand && matchesVerification;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="pb-10 relative">
      <div className="flex items-center mb-8 relative">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="hidden md:flex absolute left-0 group items-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer z-10"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>

        <div className="w-full text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Available Equipment
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Find exactly what you need from our verified providers.
          </p>
        </div>
      </div>

      <div className="mb-8 bg-white p-5 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center z-40 relative border border-black">
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

      <div className="mb-4 flex justify-between items-end border-b border-gray-100 pb-2 mt-10">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Equipment Catalog</h3>
          <p className="text-gray-500">Showing {currentProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items</p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No equipment matches your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {currentProducts.map(product => (
            <Link key={product._id} to={`/preview/${product._id}`} className="relative group block rounded-[28px] p-[3px] bg-white hover:bg-gradient-to-br hover:from-blue-500 hover:via-purple-500 hover:to-indigo-600 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer overflow-hidden">
              <div className="bg-white rounded-[25px] overflow-hidden flex flex-col sm:flex-row h-full w-full relative z-10 border border-gray-100 group-hover:border-transparent transition-colors duration-300">
                {/* Image Section - Left */}
                <div className="w-full sm:w-[45%] shrink-0 overflow-hidden bg-gray-100 relative min-h-[220px]">
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black text-gray-900 shadow-lg backdrop-blur-md bg-white/90 uppercase tracking-wide border border-white/40">
                      {product.category}
                    </span>
                  </div>
                  
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Verified Badge over image */}
                  {product.verificationStatus === 'Verified' && (
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white rounded-full p-1.5 shadow-lg shadow-blue-600/30">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </div>
                
                {/* Details Section - Right */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-extrabold text-gray-900 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                      {product.name}
                    </h4>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{product.brand || 'Premium Equipment'}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <div className="flex items-center px-2 py-1 bg-green-50 rounded-lg text-xs font-bold text-green-700 border border-green-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                        Trust {product.trustScore}
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        Cond. {product.conditionScore}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-black text-gray-900 tracking-tight">₹{product.pricePerDay}</span>
                      <span className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">/day</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_4px_15px_rgba(37,99,235,0.4)]">
                      <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="mt-12 flex justify-center items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-500 font-medium">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* More Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-xl font-bold text-gray-900">Advanced Filters</h3>
              <button onClick={() => setShowFiltersModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Brand and Verification */}
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

              {/* Price Slider */}
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

              {/* Trust Score Slider */}
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
              
              {/* Condition Score Slider */}
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

    </div>
  );
};

export default ProductsPage;
