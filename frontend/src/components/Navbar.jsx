import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const historyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load recent items when history modal opens
  useEffect(() => {
    if (isHistoryOpen) {
      try {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        setRecentItems(viewed.slice(0, 3));
      } catch (e) {
        setRecentItems([]);
      }
    }
  }, [isHistoryOpen]);

  // Click outside to close history modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setIsHistoryOpen(false);
      }
    };
    if (isHistoryOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHistoryOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`absolute top-0 left-0 right-0 z-[100] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-center pt-3`}
    >
      {/* 
        Ultra-Premium Floating Pill Navbar
      */}
      <div 
        className="relative w-[95%] max-w-8xl mx-auto rounded-[2.5rem] bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-700"
      >
        <div className="flex justify-between items-center px-4 sm:px-6 py-3">
          
          {/* Logo Section */}
          <Link 
            to="/" 
            className="group flex items-center space-x-3 relative p-1 rounded-2xl outline-none"
          >
            <h1 className="text-3xl font-black tracking-tight text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              Equipora
            </h1>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-gray-100/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-gray-200/50 shadow-inner">
            <Link 
              to="/" 
              className={`relative px-6 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all duration-300 overflow-hidden group ${
                isActive('/') ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isActive('/') && <div className="absolute inset-0 bg-gray-900 rounded-xl shadow-md -z-10 animate-fade-in"></div>}
              {!isActive('/') && <div className="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 transform origin-bottom transition-transform duration-300 rounded-xl -z-10 shadow-sm"></div>}
              <span className="relative z-10">Home</span>
            </Link>

            <Link 
              to="/products" 
              className={`relative px-6 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all duration-300 overflow-hidden group ${
                isActive('/products') ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isActive('/products') && <div className="absolute inset-0 bg-gray-900 rounded-xl shadow-md -z-10 animate-fade-in"></div>}
              {!isActive('/products') && <div className="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 transform origin-bottom transition-transform duration-300 rounded-xl -z-10 shadow-sm"></div>}
              <span className="relative z-10 flex items-center">
                Browse
              </span>
            </Link>
          </nav>

          {/* Right Section: History + Auth */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* History Toggle Button */}
            <div className="relative" ref={historyRef}>
              <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                  (isActive('/history') || isHistoryOpen)
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
                title="Recent Activities"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                
                {/* Notification Dot */}
                {!isHistoryOpen && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Recent Activities Mini-Modal */}
              {isHistoryOpen && (
                <div className="absolute top-[120%] right-0 w-[400px] sm:w-[400px] bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-[110] transform origin-top-right transition-all animate-slide-up">
                  
                  <div className="flex justify-between items-center p-5 border-b border-gray-100/60 bg-gray-50/50">
                    <h3 className="font-black text-black-900 text-lg flex items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                      Recent Activity
                    </h3>
                    <button 
                      onClick={() => setIsHistoryOpen(false)} 
                      className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto p-4 space-y-3">
                    {recentItems.length > 0 ? (
                      recentItems.map((item) => (
                        <div 
                          key={item._id} 
                          onClick={() => { setIsHistoryOpen(false); navigate(`/products/${item._id}`); }} 
                          className="group relative flex items-center space-x-4 p-3 bg-white rounded-2xl cursor-pointer transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)] hover:border-blue-200 transform hover:-translate-y-1 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200/60 z-10">
                            <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          
                          <div className="flex-grow min-w-0 z-10">
                            <p className="font-extrabold text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">{item.name}</p>
                            <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">{item.category}</p>
                          </div>
                          
                          <div className="text-right flex-shrink-0 z-10">
                            <p className="font-black text-gray-900 text-sm">₹{item.pricePerDay}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">/ day</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 px-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">No recent activities found.</p>
                        <p className="text-xs text-gray-400 mt-1">Items you view will appear here.</p>
                      </div>
                    )}
                  </div>

                  {recentItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                      <button 
                        onClick={() => { setIsHistoryOpen(false); navigate('/history'); }}
                        className="w-full py-3.5 bg-gray-900 rounded-xl text-sm font-bold text-white hover:bg-blue-600 shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all duration-300"
                      >
                        View Full History
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 border border-gray-200/60 p-1.5 rounded-[1.5rem]">
                {user.role === 'admin' && (
                  <Link 
                    to="/admin/verifications" 
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      isActive('/admin/verifications') 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                    }`}
                  >
                    Admin Center
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive('/dashboard') 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                
                <Link 
                  to="/profile" 
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive('/profile') 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  Profile
                </Link>
                <button 
                  onClick={logout} 
                  className="p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group"
                  title="Logout"
                >
                  <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="hidden md:block px-5 py-2.5 rounded-xl text-sm font-black text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="relative px-6 py-2.5 rounded-xl text-sm font-black text-white overflow-hidden shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 group-hover:scale-110"></div>
                  <span className="relative z-10 flex items-center">
                    Sign Up
                    <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                </Link>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
