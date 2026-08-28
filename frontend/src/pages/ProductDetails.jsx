import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

import ImageGalleryModal from '../components/ImageGalleryModal';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const [dates, setDates] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [calendarKey, setCalendarKey] = useState(0);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        if (dates && dates.length === 1) {
          setDates(null);
          setCalendarKey(prev => prev + 1); // Force remount to clear internal ghost state
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dates]);

  useEffect(() => {
    // Force white background for this page globally
    const outerContainer = document.querySelector('.bg-light');
    if (outerContainer) {
      outerContainer.classList.remove('bg-light');
      outerContainer.classList.add('bg-white');
    }
    
    return () => {
      // Restore on unmount
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
        
        // Track recently viewed items
        try {
          const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          const viewedItem = { ...data, viewedAt: new Date().toISOString() };
          const updatedViewed = [viewedItem, ...viewed.filter(p => p._id !== data._id)].slice(0, 30);
          localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
        } catch (e) {
          console.error("Local storage tracking error", e);
        }
        
        // Alternatives are now fetched in a separate useEffect below
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const isOwner = user && (product?.providerId?._id === user._id || product?.providerId === user._id);

  // Fetch alternatives / my products
  useEffect(() => {
    if (!product) return;
    
    const fetchAlternatives = async () => {
      try {
        if (isOwner) {
          const myRes = await api.get('/products/my-products');
          setAlternatives(myRes.data.filter(p => p._id !== product._id));
        } else if (product.category) {
          // First try exact brand & model matches
          let altRes = await api.get(`/products?brand=${encodeURIComponent(product.brand || '')}&model=${encodeURIComponent(product.model || '')}&excludeId=${product._id}`);
          
          // If no exact matches, fallback to category
          if (altRes.data.length === 0) {
            altRes = await api.get(`/products?category=${encodeURIComponent(product.category)}&excludeId=${product._id}`);
          }
          setAlternatives(altRes.data);
        }
      } catch (err) {
        console.error("Error fetching alternatives", err);
      }
    };
    fetchAlternatives();
  }, [product?._id, isOwner]);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Loading immersive experience...</div>;
  if (!product) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Product not found.</div>;

  const resolveUrl = (url) => url ? (url.startsWith('http') ? url : `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`) : null;

  const getDays = () => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      const diffTime = Math.abs(dates[1] - dates[0]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 0 ? 1 : diffDays; // If same day selected, charge for 1 day
    }
    return 0; // 0 days if incomplete range
  };

  const totalPrice = product.pricePerDay * getDays();
  const providerInitials = (product.providerId?.name || 'U').charAt(0).toUpperCase();

  // Basic TN coordinate
  const mapCenter = [11.1271, 78.6569];

  return (
    <div className="min-h-screen bg-white font-sans pb-10 relative">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-4">
      
      {/* Light Calendar Override Styles injected safely */}
      <style>{`
        @keyframes calPopIn {
          0% { transform: scale(0.8) translateY(5px); opacity: 0; }
          60% { transform: scale(1.1) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes calFadeSlideUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(17, 24, 39, 0.3); }
          70% { box-shadow: 0 0 0 12px rgba(17, 24, 39, 0); }
          100% { box-shadow: 0 0 0 0 rgba(17, 24, 39, 0); }
        }
        
        .react-calendar {
          width: 100%;
          background: white !important;
          border: none !important;
          color: #111827 !important;
          font-family: inherit;
        }
        .react-calendar__navigation button {
          color: #111827 !important;
          min-width: 44px;
          background: none;
          font-weight: bold;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .react-calendar__navigation button:disabled {
          background-color: transparent !important;
          color: #ccc !important;
        }
        .react-calendar__navigation button:enabled:hover:not(.react-calendar__tile--active):not(.react-calendar__tile--range),
        .react-calendar__navigation button:enabled:focus:not(.react-calendar__tile--active):not(.react-calendar__tile--range) {
          background-color: #f3f4f6 !important;
          border-radius: 12px;
          transform: scale(1.1);
        }
        .react-calendar__navigation button:active {
          transform: scale(0.95);
        }
        .react-calendar__month-view__weekdays {
          color: #6b7280;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: bold;
          padding-bottom: 0.5rem;
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .react-calendar__month-view__days {
          animation: calFadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          min-height: 235px;
          align-content: flex-start;
        }
        .react-calendar__month-view__days__day {
          color: #111827;
        }
        .react-calendar__tile {
          padding: 0.75em 0.5em;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .react-calendar__tile:disabled {
          background-color: transparent !important;
          color: #ccc !important;
        }
        .react-calendar__tile:enabled:hover:not(.react-calendar__tile--active):not(.react-calendar__tile--range),
        .react-calendar__tile:enabled:focus:not(.react-calendar__tile--active):not(.react-calendar__tile--range) {
          background-color: #f3f4f6 !important;
          border-radius: 12px;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          z-index: 10;
        }
        .react-calendar__tile--now {
          background: transparent !important;
          color: #111827 !important;
          font-weight: bold;
        }
        .react-calendar__tile--now::after {
          content: '';
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: #111827;
          border-radius: 50%;
        }
        
        /* Advanced Range Styling */
        .react-calendar__tile--active,
        .react-calendar__tile--range {
          background: #f3f4f6 !important; /* light gray */
          color: #111827 !important; /* black */
          border-radius: 0;
        }
        .react-calendar__tile--rangeStart {
          background: linear-gradient(135deg, #111827, #374151) !important;
          color: white !important;
          border-top-left-radius: 16px !important;
          border-bottom-left-radius: 16px !important;
          box-shadow: 0 4px 14px rgba(17, 24, 39, 0.3);
          animation: calPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, pulseGlow 2s infinite;
          z-index: 2;
        }
        .react-calendar__tile--rangeEnd {
          background: linear-gradient(135deg, #111827, #374151) !important;
          color: white !important;
          border-top-right-radius: 16px !important;
          border-bottom-right-radius: 16px !important;
          box-shadow: 0 4px 14px rgba(17, 24, 39, 0.3);
          animation: calPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, pulseGlow 2s infinite;
          z-index: 2;
        }
        .react-calendar__tile--rangeBothEnds {
          border-radius: 16px !important;
        }
        .react-calendar__tile--hover {
          background: #e5e7eb !important; /* gray-200 for hover path */
          color: #111827 !important;
        }

        /* Leaflet resets */
        .leaflet-container {
          background: #f9fafb;
          border-radius: 1rem;
        }
      `}</style>

      {/* FULL WIDTH TOP SECTION */}
      <div className="w-full animate-slide-up mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-black hover:text-gray-900 transition-colors cursor-pointer mb-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          <span className="font-semibold text-sm tracking-wide">Back to Marketplace</span>
        </button>
        
        {/* Mosaic Gallery Grid - 5 Column Layout */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
          {/* Front Image (Massive Square Hero) */}
          <div className="col-span-2 row-span-2 relative rounded-2xl md:rounded-r-none md:rounded-bl-2xl md:rounded-tl-2xl overflow-hidden bg-gray-100 group shadow-sm cursor-pointer aspect-square" onClick={() => setIsGalleryOpen(true)}>
            <img 
              src={resolveUrl(product.frontImage) || resolveUrl(product.images?.[0]) || 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=1200&q=80'} 
              alt="Front View" 
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          
          {/* Back Image (Square) */}
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden bg-gray-100 group shadow-sm cursor-pointer aspect-square" onClick={() => setIsGalleryOpen(true)}>
            <img src={resolveUrl(product.backImage) || resolveUrl(product.images?.[1]) || 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80'} alt="Back View" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
          </div>

          {/* Left Image (Square) */}
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden bg-gray-100 group shadow-sm cursor-pointer aspect-square" onClick={() => setIsGalleryOpen(true)}>
            <img src={resolveUrl(product.leftImage) || resolveUrl(product.images?.[2]) || 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=600&q=80'} alt="Left View" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
          </div>

          {/* Right Image (Top Right Corner Square) */}
          <div className="hidden md:block col-span-1 row-span-1 relative md:rounded-tr-2xl overflow-hidden bg-gray-100 group shadow-sm cursor-pointer aspect-square" onClick={() => setIsGalleryOpen(true)}>
            <img src={resolveUrl(product.rightImage) || resolveUrl(product.images?.[3]) || 'https://images.unsplash.com/photo-1513251703273-db987b50875e?auto=format&fit=crop&w=600&q=80'} alt="Right View" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
          </div>

          {/* Top Image (Square) */}
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden bg-gray-100 group shadow-sm cursor-pointer aspect-square" onClick={() => setIsGalleryOpen(true)}>
            <img src={resolveUrl(product.topImage) || resolveUrl(product.images?.[4]) || 'https://images.unsplash.com/photo-1513251703273-db987b50875e?auto=format&fit=crop&w=600&q=80'} alt="Top View" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
          </div>

          {/* Bottom Image (Bottom Right Wide Rectangle) */}
          <div className="hidden md:block col-span-2 row-span-1 relative md:rounded-br-2xl overflow-hidden bg-gray-100 group shadow-sm cursor-pointer h-full" onClick={() => setIsGalleryOpen(true)}>
            <img src={resolveUrl(product.bottomImage) || resolveUrl(product.images?.[5]) || 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=600&q=80'} alt="Bottom View" className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <button 
              onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-gray-900 font-bold px-4 py-2 text-sm rounded-xl shadow-lg border border-white/20 hover:bg-white hover:scale-105 transition-all"
            >
              View all
            </button>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: Info */}
        <div className="lg:col-span-2 space-y-5 animate-slide-up">
          
          {/* Main Title */}
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-gray-500 text-sm font-medium">{product.location}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">{product.name}</h1>
          </div>

          {/* Provider Info */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-8 pt-5">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {providerInitials}
              </div>
              <div>
                <p className="text-gray-500 text-lg uppercase tracking-wider font-semibold mb-1">Hosted By</p>
                <p className="text-xl font-bold text-gray-900">{product.providerId?.name || 'Unknown Provider'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-blue-600">01</p>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Units Available</p>
            </div>
          </div>

          {/* Description & Specs */}
          <div className="pt-2">
            <p className="text-gray-600 leading-relaxed text-base mb-8">{product.description}</p>
            
            <div className="bg-white border border-gray-300 rounded-[1.5rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-gray-900 font-extrabold text-xl mb-8">Specifications</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
                <li className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-sm font-medium">Brand</span> 
                  <span className="font-semibold text-gray-900 text-lg">{product.brand}</span>
                </li>
                <li className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-sm font-medium">Model</span> 
                  <span className="font-semibold text-gray-900 text-lg">{product.model}</span>
                </li>
                <li className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-sm font-medium">Condition</span> 
                  <span className="font-semibold text-blue-600 text-lg">{product.conditionScore}/100</span>
                </li>
                <li className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-sm font-medium">Trust Score</span> 
                  <span className="font-semibold text-[#00b050] text-lg">{product.trustScore}/100</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Alternative Providers / My Products Section */}
          {(alternatives.length > 0 || isOwner) && (
            <div className="pt-5">
              <div className="mb-6">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {isOwner ? "My Other Products" : (alternatives[0]?.brand === product.brand && alternatives[0]?.model === product.model ? "Other Providers" : "Similar Equipment")}
                </h2>
                <p className="text-gray-500 mt-2 text-base">
                  {isOwner ? "Here are the other equipment items you have currently listed for rent on Equipora." : (alternatives[0]?.brand === product.brand && alternatives[0]?.model === product.model ? "Select from multiple verified authors offering this exact equipment. Compare prices, trust scores, and locations." : "Explore other highly-rated equipment from the same category available for rent.")}
                </p>
              </div>
              
              {alternatives.length > 0 ? (
                <div className="bg-white border border-gray-200 shadow-sm overflow-hidden p-1">
                  <div className="grid grid-cols-1 divide-y divide-gray-100 max-h-[540px] overflow-y-auto custom-scrollbar">
                    {alternatives.map((alt) => (
                      <div 
                        key={alt._id} 
                        className="group flex flex-col md:flex-row items-center justify-between p-5 hover:bg-gray-200 transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-4 w-full md:w-auto mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner flex-shrink-0 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300">
                            {alt.providerId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{alt.providerId?.name || 'Verified Provider'}</p>
                            <div className="flex items-center mt-1 space-x-3">
                              <span className="flex items-center text-xs text-gray-500 font-medium">
                                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {alt.location.split(' - ')[0]}
                              </span>
                              <span className="flex items-center text-xs text-[#00b050] font-bold bg-[#00b050]/10 px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                {alt.trustScore || 100} Trust
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto md:space-x-6">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">₹{alt.pricePerDay}<span className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">/day</span></p>
                          </div>
                          
                          <button 
                            onClick={() => {
                              window.scrollTo(0, 0);
                              navigate(`/products/${alt._id}`);
                            }}
                            className="bg-gray-900 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-md flex items-center space-x-2"
                          >
                            <span className="text-sm px-5">{isOwner ? "Preview" : "View"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No other products available</h3>
                  <p className="text-gray-500">You haven't listed any other equipment yet. When you do, they will appear right here!</p>
                  <Link to="/add-product" className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md transform hover:-translate-y-1">
                    Add New Equipment
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Map & Sticky Booking Widget */}
        <div className="lg:col-span-1 relative z-20 space-y-8 mt-3">
          
          {/* Map Section */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>
            <div className="h-80 w-full rounded-2xl overflow-hidden border border-gray-900 relative z-10">
              <MapContainer center={mapCenter} zoom={7} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  attribution='&copy; Google Maps'
                />
                <Marker position={mapCenter}>
                  <Popup className="text-gray-900">
                    <span className="font-bold">{product.location}</span><br />Approximate area.
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Sticky Booking Widget */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 sticky top-28 shadow-xl animate-fade-in-up">
            
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-200">
              <div>
                <span className="text-4xl font-extrabold text-gray-900">₹{product.pricePerDay}</span>
                <span className="text-gray-500 ml-2 font-medium">/ day</span>
              </div>
            </div>

            <div className="space-y-6">

            {/* Calendar Component */}
            <div ref={calendarRef} className="mb-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
              <Calendar 
                key={calendarKey}
                onChange={setDates} 
                selectRange={true} 
                allowPartialRange={true}
                showNeighboringMonth={false}
                value={dates} 
                minDate={new Date()} 
              />
            </div>

            {/* Time Selection Component */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Time</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-transparent text-gray-900 font-bold focus:outline-none"
                />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">End Time</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-transparent text-gray-900 font-bold focus:outline-none"
                />
              </div>
            </div>

            {isOwner ? (
              <div className="flex flex-col space-y-3 mt-5">
                <Link 
                  to={`/edit-product/${product._id}`}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg text-center transition-all shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit Product Details
                </Link>
              </div>
            ) : (
              <button 
                disabled={!dates || dates.length !== 2 || !startTime || !endTime}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                Request to Rent
              </button>
            )}

            <div className="mt-0 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600 mb-3 text-sm">
                <span>₹{product.pricePerDay} x {getDays()} days</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-3 text-sm">
                <span>Security Deposit</span>
                <span>₹{product.securityDeposit}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-xl mt-1 pt-4 border-t border-gray-200 border-dashed">
                <span>Total</span>
                <span className="text-blue-600">₹{totalPrice + product.securityDeposit}</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <ImageGalleryModal 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        product={product} 
      />
    </div>
  );
};

export default ProductDetails;
