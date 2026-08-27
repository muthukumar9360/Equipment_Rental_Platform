import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/my-products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(p => p.verificationStatus === activeTab);

  const tabs = ['All', 'Verified', 'Pending', 'Rejected'];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Products</h1>
            <p className="text-gray-500 mt-1">Manage your inventory and track approval statuses.</p>
          </div>
          <Link 
            to="/add-product" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Add New Product
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => {
            const count = tab === 'All' ? products.length : products.filter(p => p.verificationStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't added any products in this category yet. Click the button below to start listing your equipment.</p>
            <Link 
              to="/add-product" 
              className="inline-flex px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const cleanUrl = product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`) : 'https://via.placeholder.com/400';
              
              let statusBadge = '';
              if (product.verificationStatus === 'Verified') {
                statusBadge = 'bg-green-100 text-green-700 border-green-200';
              } else if (product.verificationStatus === 'Rejected') {
                statusBadge = 'bg-red-100 text-red-700 border-red-200';
              } else {
                statusBadge = 'bg-yellow-100 text-yellow-700 border-yellow-200';
              }

              return (
                <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img src={cleanUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${statusBadge}`}>
                        {product.verificationStatus}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-extrabold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{product.brand}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Earnings</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-gray-900">₹{product.pricePerDay}</span>
                          <span className="text-xs text-gray-500 font-bold">/day</span>
                        </div>
                      </div>
                      <Link 
                        to={`/product/${product._id}`}
                        className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white transition-colors duration-300"
                        title="View Listing"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyProducts;
