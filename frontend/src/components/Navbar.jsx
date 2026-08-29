import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const historyRef = useRef(null);

  // Notifications Modal State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  // Profile Dropdown State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

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

  // Click outside to close history modal and profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setIsHistoryOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleDismissNotification = async (reqId) => {
    try {
      await api.post(`/users/reject-follow/${reqId}`);
      setUser(prev => ({ 
        ...prev, 
        followRequests: prev.followRequests?.filter(r => r._id !== reqId) 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header 
      className={`absolute top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-center pt-3`}
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
              {!isActive('/') && <div className="absolute inset-0 bg-blue-100 scale-y-0 group-hover:scale-y-100 transform origin-bottom transition-transform duration-300 rounded-2xl -z-10 shadow-sm"></div>}
              <span className="relative z-10">Home</span>
            </Link>

            <Link 
              to="/products" 
              className={`relative px-6 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all duration-300 overflow-hidden group ${
                isActive('/products') ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isActive('/products') && <div className="absolute inset-0 bg-gray-900 rounded-xl shadow-md -z-10 animate-fade-in"></div>}
              {!isActive('/products') && <div className="absolute inset-0 bg-blue-100 scale-y-0 group-hover:scale-y-100 transform origin-bottom transition-transform duration-300 rounded-2xl -z-10 shadow-sm"></div>}
              <span className="relative z-10 flex items-center">
                Browse
              </span>
            </Link>
          </nav>

          {/* Right Section: History + Auth */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Saved & Liked Buttons */}
            {user && (
              <>
                <Link 
                  to="/saved"
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${isActive('/saved') ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'}`}
                  title="Saved Products"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </Link>
                <Link 
                  to="/liked"
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${isActive('/liked') ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
                  title="Liked Products"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </Link>
              </>
            )}

            {/* Notifications Toggle Button */}
            {user && (
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsHistoryOpen(false); }}
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                    isNotificationsOpen
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                  title="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  
                  {/* Notification Dot */}
                  {user.followRequests?.length > 0 && !isNotificationsOpen && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </button>

                {/* Notifications Mini-Modal */}
                {isNotificationsOpen && (
                  <div className="absolute top-[120%] right-0 w-[350px] bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-[110] transform origin-top-right transition-all animate-slide-up">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100/60 bg-gray-50/50">
                      <h3 className="font-black text-black-900 text-lg flex items-center">
                        Notifications
                      </h3>
                      <button onClick={() => setIsNotificationsOpen(false)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
                      {user.followRequests?.length > 0 ? (
                        user.followRequests.map(req => (
                          <div key={req._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                            <Link to={`/profile/${req._id}`} onClick={() => setIsNotificationsOpen(false)} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-200 block">
                              {req.profileImage ? <img src={req.profileImage} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">{req.name?.charAt(0)}</div>}
                            </Link>
                            <div className="grow overflow-hidden leading-tight">
                              <Link to={`/profile/${req._id}`} onClick={() => setIsNotificationsOpen(false)} className="font-bold text-gray-900 text-sm truncate hover:underline block">{req.username}</Link>
                              <p className="text-gray-500 text-xs truncate">started following you</p>
                            </div>
                            <button onClick={() => handleDismissNotification(req._id)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors shrink-0">Dismiss</button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 px-4">
                          <p className="text-gray-500 font-medium">No new notifications.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Toggle Button */}
            {user && (
              <div className="relative" ref={historyRef}>
                <button 
                onClick={() => { setIsHistoryOpen(!isHistoryOpen); setIsNotificationsOpen(false); }}
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
            )}

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
                
                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 px-3 rounded-[1.25rem] bg-gray-100 hover:bg-gray-200 transition-all duration-300 group outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 hidden sm:block">{user.name?.split(' ')[0] || 'Menu'}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 group-hover:text-gray-900">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl border border-gray-900 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-2 animate-fade-in-up z-[200] overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-50/50 before:to-transparent before:z-[-1]">
                      
                      {/* User Info Header */}
                      <div className="px-4 py-3 mb-1 border-b border-gray-50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      {/* Primary Action (Add Product) - Hidden for Admins */}
                      {user.role !== 'admin' && (
                        <Link 
                          to="/add-product" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all duration-300 mb-1 group"
                        >
                          <svg className="w-4 h-4 mr-2.5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                          Add New Product
                        </Link>
                      )}

                      {/* Other Links */}
                      <Link 
                        to="/profile" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center w-full px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        My Profile
                      </Link>

                      {/* Logout */}
                      <button 
                        onClick={() => { logout(); setIsProfileDropdownOpen(false); }} 
                        className="flex items-center w-full px-4 py-2.5 mt-1 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors group"
                      >
                        <svg className="w-4 h-4 mr-2.5 text-red-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="relative px-6 py-2.5 rounded-xl text-sm font-black text-white overflow-hidden shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 group hidden md:block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 group-hover:scale-110"></div>
                  <span className="relative z-10 flex items-center">
                    Login
                  </span>
                </Link>
                <Link 
                  to="/register" 
                  className="relative px-6 py-2.5 rounded-xl text-sm font-black text-white overflow-hidden shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 group-hover:scale-110"></div>
                  <span className="relative z-10 flex items-center">
                    Sign Up
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
