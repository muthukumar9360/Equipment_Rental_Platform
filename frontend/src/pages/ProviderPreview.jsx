import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

const ProviderPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [baseProduct, setBaseProduct] = useState(null);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const outerContainer = document.querySelector('.bg-light');
    if (outerContainer) {
      outerContainer.classList.remove('bg-light');
      outerContainer.classList.add('bg-white');
    }
    return () => {
      if (outerContainer) {
        outerContainer.classList.add('bg-light');
        outerContainer.classList.remove('bg-white');
      }
    };
  }, []);

  useEffect(() => {
    const fetchProductAndAlternatives = async () => {
      try {
        // 1. Fetch the specific product that was clicked
        const { data } = await api.get(`/products/${id}`);
        setBaseProduct(data);
        
        // 2. Fetch all products with the same brand & model to list all authors
        if (data.brand && data.model) {
          const altRes = await api.get(`/products?brand=${encodeURIComponent(data.brand)}&model=${encodeURIComponent(data.model)}`);
          setAllProviders(altRes.data);
        }
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndAlternatives();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500 font-medium">Loading Product Hub...</div>;
  if (!baseProduct) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500 font-medium">Product not found.</div>;

  const totalPages = Math.ceil(allProviders.length / itemsPerPage);
  const currentProviders = allProviders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div className="min-h-screen bg-white font-sans pb-5 animate-fade-in">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4">
        
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold bg-gray-50 px-4 py-2 rounded-full border border-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            <span>Back to Marketplace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-2">
          
          {/* LEFT SIDE (Product Focus) */}
          <div className="lg:col-span-5">
            <div>
              
              <div className="w-full h-[400px] rounded-[32px] overflow-hidden shadow-sm relative bg-gray-100">
                <img 
                  src={baseProduct.images?.[0] || 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=1200&q=80'} 
                  alt={baseProduct.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center mt-8">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  {baseProduct.brand} {baseProduct.model}
                </h1>
                <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                  {baseProduct.description}
                </p>

                <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-left">Equipment Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Brand</p>
                      <p className="font-semibold text-gray-900">{baseProduct.brand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Category</p>
                      <p className="font-semibold text-gray-900">{baseProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Sub-Category</p>
                      <p className="font-semibold text-gray-900">{baseProduct.subCategory}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (Compare Providers) */}
          <div className="lg:col-span-7 mt-12 lg:mt-0 space-y-6 pl-0 lg:pl-10">
            
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Compare Providers</h2>
              <p className="text-gray-500 text-lg mb-8">Select from multiple verified authors offering this exact equipment.</p>
              
              <div className="space-y-6 min-h-[600px]">
                {currentProviders.map(providerProduct => {
                  const author = providerProduct.providerId;
                  const initials = author?.name?.charAt(0).toUpperCase() || 'U';
                  
                  return (
                    <div 
                      key={providerProduct._id} 
                      className="group bg-white border-4 border-gray-100 hover:border-blue-400 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col sm:flex-row gap-6 cursor-pointer"
                      onClick={(e) => {
                        setSelectedPreview(providerProduct);
                      }}
                    >
                      
                      {/* Product Thumbnail */}
                      <div className="w-full sm:w-[140px] h-[140px] rounded-2xl overflow-hidden shrink-0 bg-gray-100 relative">
                        <img src={providerProduct.images?.[0] || 'https://via.placeholder.com/400'} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl font-black shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                              {initials}
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Hosted By</p>
                              <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">{author?.name || 'Unknown'}</h3>
                            </div>
                          </div>
                          <div className="bg-green-50 px-3 py-1 rounded-xl border border-green-100 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                            <span className="text-green-700 font-bold text-xs uppercase tracking-wider">{providerProduct.trustScore} Trust</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between border-t border-gray-50 pt-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 mb-1 flex items-center uppercase tracking-widest">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {providerProduct.location.split(' - ')[0]}
                            </p>
                            <div className="flex items-end">
                              <span className="font-black text-3xl text-gray-900 tracking-tight">₹{providerProduct.pricePerDay}</span>
                              <span className="text-gray-400 text-xs font-bold ml-1 uppercase tracking-wider mb-1.5">/ day</span>
                            </div>
                          </div>
                          
                          <button 
                            className="mt-4 sm:mt-0 px-6 py-3 bg-gray-50 text-gray-600 border border-gray-200 text-sm font-extrabold rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-[0_8px_20px_rgba(37,99,235,0.4)] transition-all duration-300"
                          >
                            View Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center space-x-2">
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
            </div>

          </div>
        </div>
      </div>
      
      <ProductQuickViewModal 
        isOpen={!!selectedPreview}
        onClose={() => setSelectedPreview(null)}
        product={selectedPreview}
      />
    </div>
  );
};

export default ProviderPreview;
