import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

const SavedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Adjust based on grid layout

  useEffect(() => {
    const fetchSavedProducts = async () => {
      try {
        const { data } = await api.get('/users/saved');
        setProducts(data);
      } catch (err) {
        setError('Failed to load saved products.');
      } finally {
        setLoading(false);
      }
    };
    fetchSavedProducts();
  }, []);

  const handleUnsave = async (productId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    try {
      await api.post(`/users/save/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Error removing saved product', err);
    }
  };

  if (loading) {
    return <Loader type="fullpage" text="Loading Saved Products..." />;
  }

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Auto-adjust page if current page becomes empty after unliking
  if (currentProducts.length === 0 && currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }

  return (
    <div className="w-full animate-fade-in pt-5">
      <div className="max-w-8xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Saved Products</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Products you saved for later.</p>
          </div>
        </div>

        {error && <div className="text-red-500 font-bold mb-4">{error}</div>}

        {products.length === 0 ? (
          <div className="text-center py-20 mb-5">
            <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </div>
            <p className="text-gray-500 font-medium">You haven't saved any products yet.</p>
            <button onClick={() => navigate('/products')} className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all shadow-md">Browse Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {currentProducts.map((product) => (
              <div 
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                className="group relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200"
              >
                <img 
                  src={product.frontImage || product.images?.[0] || 'https://via.placeholder.com/400'} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => handleUnsave(product._id, e)}
                    className="w-10 h-10 rounded-full bg-yellow-500/90 hover:bg-yellow-600 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg transform hover:scale-110"
                    title="Remove from Saved"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <h4 className="text-xl font-black text-white truncate mb-1">{product.name}</h4>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-gray-300 truncate w-2/3">{product.brand} - {product.model}</p>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#00b050]">₹{product.pricePerDay}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">/ day</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages >= 1 && (
          <div className="flex justify-center items-center mt-12 space-x-2 pb-8">
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
                      ? 'bg-yellow-500 text-white shadow-md' 
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

      </div>
    </div>
  );
};

export default SavedProducts;
