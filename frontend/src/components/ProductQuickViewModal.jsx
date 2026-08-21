import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductQuickViewModal = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Ensure we have an array of at least 4 images for the thumbnails
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [
        'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513251703273-db987b50875e?auto=format&fit=crop&w=600&q=80'
      ];
      
  // If product has less than 4 images, pad it with placeholders for the design
  const displayImages = [...images];
  while (displayImages.length < 4) {
    displayImages.push('https://via.placeholder.com/600x400?text=No+Image');
  }

  const handleShowDates = () => {
    onClose();
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Blurred Glassmorphism Backdrop */}
      <div 
        className="absolute inset-0 bg-white/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      ></div>

      {/* Main Container Wrapper */}
      <div className="relative z-10 flex items-center w-full max-w-[1100px] h-auto max-h-[90vh]">
        
        {/* Floating Thumbnails (Outside the white modal) */}
        <div className="hidden sm:flex flex-col space-y-4 mr-6 justify-center shrink-0">
          {displayImages.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-[3px] shadow-lg transition-all ${
                activeImageIndex === idx ? 'border-white scale-110 shadow-xl' : 'border-white/60 hover:border-white hover:opacity-100 opacity-85'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Modal White Box Content */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row relative border border-black">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* LEFT SIDE: Main Large Image */}
          <div className="w-full md:w-[50%] p-4 bg-white shrink-0 h-[350px] md:h-[500px]">
            <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-gray-100 relative">
              <img 
                src={displayImages[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

          {/* RIGHT SIDE: Details */}
          <div className="w-full md:w-[50%] pt-10 p-4 flex flex-col justify-center bg-white overflow-y-auto">
            
          {/* Author Details Section */}
          <div className="flex items-center space-x-3 mb-4 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl font-black shadow-inner">
              {product.providerId?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Hosted By</p>
              <h3 className="text-lg font-extrabold text-gray-900">{product.providerId?.name || 'Verified Provider'}</h3>
            </div>
            <div className="ml-auto bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 flex items-center">
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
            {product.name}
          </h2>
          
          <div className="flex items-center text-gray-700 mb-6 font-medium">
            <span className="font-bold text-gray-900">₹{product.pricePerDay}</span>
            <span className="mx-1 text-gray-400">/</span>
            <span>day</span>
            <span className="mx-2 text-gray-300">·</span>
            <span>{product.brand}</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1 max-h-[150px] overflow-y-auto pr-2">
            {product.description || "Turn your project into a success. This high-quality equipment is carefully maintained and ready for your needs. We'll ensure you have everything required to get the job done efficiently and safely. Perfect for professionals and enthusiasts alike."}
          </p>

          <div className="mt-auto mb-4 flex justify-center">
            <button 
              onClick={handleShowDates}
              className="px-8 py-3 bg-[#e61e4d] text-white font-bold rounded-xl hover:bg-[#d71946] transition-colors shadow-md w-full sm:w-auto"
            >
              Show Full Details
            </button>
          </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductQuickViewModal;
