import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

const ProviderPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Force white background for this page globally
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
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500 font-medium">Loading Provider Profile...</div>;
  if (!product) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500 font-medium">Profile not found.</div>;

  const providerName = product.providerId?.name || 'Verified Provider';
  const providerInitials = providerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white font-sans pt-6 pb-20 animate-fade-in relative">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar / Back Button Area */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold bg-gray-50 px-4 py-2 rounded-full border border-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            <span>Back to Marketplace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT SIDE (Sticky Hero Section) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-28">
              
              {/* Hero Image */}
              <div className="w-full h-[400px] rounded-[32px] overflow-hidden shadow-sm relative bg-gray-100">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=1200&q=80'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlapping Avatar */}
              <div className="flex justify-center -mt-12 relative z-10">
                <div className="w-24 h-24 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {/* If they had an avatar URL we'd show it here, for now initials */}
                  {providerInitials}
                </div>
              </div>

              {/* Title & Stats */}
              <div className="text-center mt-6">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="mt-3 text-gray-600 text-lg">
                  Provided by <span className="font-bold text-gray-900">{providerName}</span>
                </p>

                <div className="flex items-center justify-center space-x-4 mt-4 text-sm font-bold text-gray-700">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-900 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span>{product.trustScore / 20} Trust Rating</span>
                  </div>
                  <span>·</span>
                  <span className="underline cursor-pointer">{product.location}</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE (Scrollable Details) */}
          <div className="lg:col-span-7 mt-12 lg:mt-0 space-y-12 pl-0 lg:pl-10">
            
            {/* PACKAGES / OFFERINGS */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Available Equipment Package</h2>
              
              <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-[200px] h-[140px] rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                  <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=600&q=80'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{product.brand} {product.model}</h3>
                    <p className="text-gray-500 mt-2 text-sm line-clamp-2 leading-relaxed">
                      {product.description || "In this package you get the complete equipment set carefully maintained and ready for immediate usage."}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-gray-900">₹{product.pricePerDay}</span>
                      <span className="text-gray-500 text-xs ml-1">/ day</span>
                      <span className="text-gray-400 text-xs mx-2">·</span>
                      <span className="text-gray-500 text-xs">Security: ₹{product.securityDeposit}</span>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors">
                      View Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* QUALIFICATIONS / TRUST */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Provider qualifications</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Card */}
                <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {providerInitials}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{providerName}</h3>
                  <p className="text-gray-500 text-sm mt-1">Equipora Verified Provider</p>
                  
                  <button onClick={() => setIsModalOpen(true)} className="mt-6 w-full py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-bold hover:bg-gray-50 transition-colors">
                    Message {providerName}
                  </button>
                  <p className="text-xs text-gray-400 mt-3 max-w-[200px]">
                    To protect your payment, always communicate and pay through Equipora.
                  </p>
                </div>

                {/* Right Points */}
                <div className="space-y-6 flex flex-col justify-center">
                  
                  <div className="flex">
                    <div className="shrink-0 mr-4 mt-1">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Verified Identity</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.providerId?.kycStatus === 'ACTIVE' 
                          ? 'This provider has passed the rigorous manual Equipora KYC review process.' 
                          : 'This provider has completed the basic Equipora verification process.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="shrink-0 mr-4 mt-1">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Exceptional Trust Score</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Maintains an active trust score of {product.providerId?.trustScore || 100} out of 100 on the platform.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="shrink-0 mr-4 mt-1">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Equipment Expert</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Offers high quality, well-maintained {product.category.toLowerCase()} equipment.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Booking Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-extrabold text-gray-900">₹{product.pricePerDay}</span>
          <span className="text-gray-500 text-xs ml-1">/ day</span>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#e61e4d] text-white font-bold rounded-xl hover:bg-[#d71946]">
          Show dates
        </button>
      </div>
      <ProductQuickViewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={product} 
      />
    </div>
  );
};

export default ProviderPreview;
