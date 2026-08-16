import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RecentActivity from '../components/RecentActivity';
import FeaturedCategories from '../components/FeaturedCategories';
import QuickCategories from '../components/QuickCategories';
import HeroShowcase from '../components/HeroShowcase';
import ExploreSections from '../components/ExploreSections';
import LocationsAndSearches from '../components/LocationsAndSearches';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isModalBrandOpen, setIsModalBrandOpen] = useState(false);
  const [isModalStatusOpen, setIsModalStatusOpen] = useState(false);

  const [maxPrice, setMaxPrice] = useState(1000);
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [minConditionScore, setMinConditionScore] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  const [tempMaxPrice, setTempMaxPrice] = useState(1000);
  const [tempMinTrustScore, setTempMinTrustScore] = useState(0);
  const [tempMinConditionScore, setTempMinConditionScore] = useState(0);
  const [tempSelectedBrand, setTempSelectedBrand] = useState('');
  const [tempVerificationStatus, setTempVerificationStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLocation, maxPrice, minTrustScore, minConditionScore, selectedBrand, verificationStatus]);

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

  if (loading) return <div className="text-center py-20 text-gray-500">Loading products...</div>;

  const categories = [...new Set(products.map(p => p.category))].sort();
  const locations = [...new Set(products.map(p => p.location).filter(Boolean))].sort();
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchLower) || 
                          (product.brand?.toLowerCase() || '').includes(searchLower);
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesLocation = selectedLocation ? product.location === selectedLocation : true;
    const matchesPrice = product.pricePerDay <= maxPrice;
    const matchesTrust = product.trustScore >= minTrustScore;
    const matchesCondition = product.conditionScore >= minConditionScore;
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    const matchesVerification = verificationStatus ? product.verificationStatus === verificationStatus : true;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && 
           matchesTrust && matchesCondition && matchesBrand && matchesVerification;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="pb-0">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Trust-First Equipment Rental
        </h2>
        <p className="text-xl text-black max-w-2xl mx-auto">
          Rent high-quality gear with confidence. Verified users, guaranteed condition, and secure process.
        </p>
      </div>

      <div className="mb-6 bg-white p-5 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center z-40 relative border border-black">
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
        <div className="w-full lg:w-56 relative">
          <button 
            type="button"
            className="w-full flex items-center justify-between px-4 py-3.5 border border-black rounded-xl bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left"
            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsLocationOpen(false); }}
          >
            <div className="flex items-center truncate">
              <span className="p-1 bg-blue-50 text-blue-600 rounded-md mr-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
              </span>
              <span className="font-medium text-gray-700 truncate">{selectedCategory || 'All Categories'}</span>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isCategoryOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none">
              <ul className="py-1">
                <li 
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm font-medium ${!selectedCategory ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                  onClick={() => { setSelectedCategory(''); setIsCategoryOpen(false); }}
                >
                  All Categories
                </li>
                {categories.map(cat => (
                  <li 
                    key={cat}
                    className={`px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm font-medium ${selectedCategory === cat ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                    onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); }}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Custom Location Dropdown */}
        <div className="w-full lg:w-56 relative">
          <button 
            type="button"
            className="w-full flex items-center justify-between px-4 py-3.5 border border-black rounded-xl bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left"
            onClick={() => { setIsLocationOpen(!isLocationOpen); setIsCategoryOpen(false); }}
          >
            <div className="flex items-center truncate">
              <span className="p-1 bg-red-50 text-red-500 rounded-md mr-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              </span>
              <span className="font-medium text-gray-700 truncate">{selectedLocation || 'All Locations'}</span>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isLocationOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none">
              <ul className="py-1">
                <li 
                  className={`px-4 py-3 cursor-pointer hover:bg-red-50 text-sm font-medium ${!selectedLocation ? 'text-red-600 bg-red-50/50' : 'text-gray-700'}`}
                  onClick={() => { setSelectedLocation(''); setIsLocationOpen(false); }}
                >
                  All Locations
                </li>
                {locations.map(loc => (
                  <li 
                    key={loc}
                    className={`px-4 py-3 cursor-pointer hover:bg-red-50 text-sm font-medium ${selectedLocation === loc ? 'text-red-600 bg-red-50/50' : 'text-gray-700'}`}
                    onClick={() => { setSelectedLocation(loc); setIsLocationOpen(false); }}
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button 
          onClick={openFilters}
          className="w-full lg:w-auto px-6 py-3.5 bg-gray-900 border border-transparent text-white font-medium rounded-xl hover:bg-blue-600 flex items-center justify-center shadow-sm transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          Filters
        </button>
      </div>

      <HeroShowcase />

      <FeaturedCategories onSelectCategory={(cat) => setSelectedCategory(cat)} />

      <div className="mb-3 flex justify-between items-end border-b border-gray-100 pb-2">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Available Equipment</h3>
          <p className="text-gray-500">Showing {currentProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items</p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No products match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {currentProducts.map(product => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col">
              <div className="aspect-w-16 aspect-h-10 w-full overflow-hidden bg-gray-200">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-gray-900 pr-2 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 shrink-0 border border-blue-100">
                    {product.category}
                  </span>
                </div>
                
                <div className="flex items-center mb-4 mt-1 space-x-2">
                  <div className="bg-green-50 border border-green-100 px-2 py-1 rounded text-xs text-green-700 font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Trust Score {product.trustScore}
                  </div>
                  {product.location && (
                    <div className="bg-gray-50 border border-gray-200 px-2 py-1 rounded text-xs text-gray-600 font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                      {product.location}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-gray-900">${product.pricePerDay}</span>
                    <span className="text-sm font-medium text-gray-500"> /day</span>
                  </div>
                  <Link to={`/products/${product._id}`} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-blue-600 transition-colors shadow-sm">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                  <span className="text-sm font-bold text-blue-600">${tempMaxPrice}</span>
                </div>
                <input 
                  type="range" min="10" max="1000" step="10"
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

      {/* Quick Emoji Categories */}
      <QuickCategories />

      {/* Recent Activity Slider */}
      <RecentActivity />

      {/* Locations and Popular Searches */}
      <LocationsAndSearches />

      {/* Explore SEO Sections */}
      <ExploreSections />
    </div>
  );
};

export default Marketplace;
