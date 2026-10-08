import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import VerificationTimeline from '../components/VerificationTimeline';
import { useNavigate } from 'react-router-dom';

const BACKEND_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5024/api').replace('/api', '');
const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `${BACKEND_BASE}${img.startsWith('/') ? '' : '/'}${img}`;
};

const BookingTimeline = ({ booking }) => {
  const isRejected = booking.status === 'Cancelled' || booking.status === 'Rejected';
  
  if (isRejected) {
    return (
      <div className="w-full mt-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-center">
        <p className="text-red-600 font-black text-xs uppercase tracking-wider">Booking {booking.status}</p>
      </div>
    );
  }

  const steps = [
    { label: 'Requested', done: true },
    { label: 'Approved', done: ['Approved', 'Active', 'Return Scheduled', 'Completed'].includes(booking.status) },
    { label: 'Received', done: ['Active', 'Return Scheduled', 'Completed'].includes(booking.status) },
    { label: 'Return Initiated', done: ['Return Scheduled', 'Completed'].includes(booking.status) },
    { label: 'Refunded', done: ['Completed'].includes(booking.status) },
  ];
  
  return (
    <div className="flex items-center justify-between w-full my-6 px-1">
      {steps.map((step, idx) => (
        <div key={idx} className="flex flex-col items-center relative w-1/5">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${step.done ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
            {step.done ? (
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <span className="text-[10px] sm:text-xs font-black">{idx + 1}</span>
            )}
          </div>
          <span className={`text-[8px] sm:text-[9.5px] mt-2 font-black uppercase tracking-wider text-center line-clamp-1 ${step.done ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>{step.label}</span>
          {idx < steps.length - 1 && (
            <div className={`absolute top-3.5 sm:top-4 left-1/2 w-full h-1 -z-0 transition-all duration-700 ${steps[idx+1].done ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-200'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rentals'); // 'rentals' | 'provider' | 'trust' | 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null); // Digital Pass Modal
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
        return;
      }
      setLoading(true);
      Promise.allSettled([
        api.get('/bookings'),
        api.get('/products/my-products')
      ]).then(([bookingsRes, productsRes]) => {
        if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data || []);
        if (productsRes.status === 'fulfilled') setMyProducts(productsRes.value.data || []);
      }).finally(() => setLoading(false));
    }
  }, [user, navigate]);

  if (!user) return null;

  // Filter rentals & provider bookings
  const myRentals = bookings.filter(b => b.renter === user._id || (b.renter && b.renter._id === user._id));
  const providerOrders = bookings.filter(b => b.provider === user._id || (b.provider && b.provider._id === user._id));

  // Financial Computations
  const totalDepositInEscrow = myRentals
    .filter(b => ['Approved', 'Active', 'Return Scheduled'].includes(b.status))
    .reduce((sum, b) => sum + (b.securityDeposit || 0), 0);

  const totalSpentOnRentals = myRentals
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.totalPrice || 0) + (b.securityDeposit || 0), 0);

  const providerEarnings = providerOrders
    .filter(b => ['Approved', 'Active', 'Completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const activeRentalsCount = myRentals.filter(b => ['Approved', 'Active', 'Return Scheduled'].includes(b.status)).length;
  const pendingOrdersCount = providerOrders.filter(b => b.status === 'Pending').length;

  // Filtered rentals list for Search & Filter
  const filteredRentals = myRentals.filter(b => {
    const matchesSearch = !searchQuery || 
      (b.product?.name && b.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b._id && b._id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReturn = async (bookingId) => {
    if (!window.confirm('Initiate return process? Equipora admin will inspect the item and immediately refund your security deposit.')) return;
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'Return Scheduled' });
      alert('Return initiated! Admin logistics has been notified for handover & deposit refund.');
      // Refresh local bookings state
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Return Scheduled' } : b));
    } catch (e) {
      alert('Failed to initiate return. Please try again.');
    }
  };

  const handleConfirmReceived = async (bookingId) => {
    if (!window.confirm('Confirm that you have received and inspected this equipment in good condition? This will activate your rental period.')) return;
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'Active' });
      alert('Product received confirmed! Rental is now Active.');
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Active' } : b));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to confirm product receipt.');
    }
  };

  const updateProviderStatus = async (id, status) => {
    try {
      const res = await api.put(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: res.data.status } : b));
      alert(`Order status updated to ${status}`);
    } catch (err) {
      alert("Error updating order status");
    }
  };

  const handleOpenChat = (targetUserId, targetProductId) => {
    if (!targetUserId) {
      alert("Contact information for this user is unavailable.");
      return;
    }
    const cleanUserId = typeof targetUserId === 'object' ? targetUserId._id : targetUserId;
    const cleanProductId = typeof targetProductId === 'object' ? targetProductId._id : targetProductId;

    if (cleanUserId === user._id) {
      alert("You are the owner of this equipment.");
      return;
    }

    navigate(`/messages?user=${cleanUserId}`, {
      state: {
        receiverId: cleanUserId,
        productId: cleanProductId
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pb-12">
      {/* ===================== HERO HEADER (WHITE / LIGHT THEME) ===================== */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200/80 shadow-[0_4px_30px_rgb(0,0,0,0.02)] pt-8 pb-12">
        {/* Soft background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Top Profile & Welcome Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200/80">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-blue-500/10">
                  <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-white text-3xl font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${user.kycStatus === 'Fully Verified' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider rounded-xl">
                    {user.role}
                  </span>
                  {user.kycStatus === 'Fully Verified' && (
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified Member
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Equipora Peer-to-Peer Rental Hub &middot; Member ID: #{user._id?.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Live Trust & Verification Meter */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trust Score</p>
                  <p className="text-xl font-black text-slate-900">{user.trustScore || 100} <span className="text-xs text-blue-600">/ 100</span></p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Identity Clearance</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${user.kycStatus === 'Fully Verified' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="text-sm font-bold text-slate-800">{user.kycStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== HERO KPI STATS ===================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {/* Stat 1 */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Active Rentals</span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{activeRentalsCount}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Equipments in hand</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Escrow Held</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
              </div>
              <p className="text-3xl font-black text-emerald-600">₹{totalDepositInEscrow}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">100% Refundable deposit</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">Provider Earnings</span>
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </span>
              </div>
              <p className="text-3xl font-black text-indigo-600">₹{providerEarnings}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{pendingOrdersCount} orders waiting</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-600">Total Spent</span>
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                </span>
              </div>
              <p className="text-3xl font-black text-purple-600">₹{totalSpentOnRentals}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Rent + Initial deposits</p>
            </div>
          </div>

        </div>
      </div>

      {/* ===================== TAB SELECTOR CONTROLLER ===================== */}
      <div className="w-full px-4 sm:px-8 lg:px-4 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('rentals')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'rentals'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              My Active Rentals ({myRentals.length})
            </button>

            <button
              onClick={() => setActiveTab('provider')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'provider'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Provider Fleet &amp; Orders ({providerOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('trust')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                activeTab === 'trust'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Escrow &amp; Trust Passport
            </button>
          </div>

          {/* Quick status chip info */}
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-400">Current View: </span>
            <span className="text-xs font-black uppercase text-blue-600 tracking-wider">
              {activeTab === 'rentals' ? 'Customer Rental Hub' : activeTab === 'provider' ? 'Equipment Lister Desk' : activeTab === 'trust' ? 'Escrow & Safety Vault' : 'Admin Operations'}
            </span>
          </div>
        </div>
      </div>

      {/* ===================== TAB CONTENT BODIES ===================== */}
      <div className="w-full px-4 sm:px-8 lg:px-4 mt-8">

        {/* ----------------- TAB 1: RENTER / CUSTOMER RENTALS ----------------- */}
        {activeTab === 'rentals' && (
          <div className="space-y-8">
            {/* Filter & Search Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by gear name or #ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition-all"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-[11px] font-black uppercase text-slate-400 mr-2">Filter:</span>
                {['ALL', 'Active', 'Approved', 'Return Scheduled', 'Completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      statusFilter === status
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Rentals Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {loading ? (
                <div className="col-span-full py-16 text-center text-slate-500 font-bold">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  Loading your rented equipment fleet...
                </div>
              ) : filteredRentals.length === 0 ? (
                <div className="col-span-full p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">No active rentals matching filter</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">Browse our peer-to-peer verified catalog to rent DSLRs, Drones, Lighting, and specialized production gear.</p>
                  <button onClick={() => navigate('/products')} className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all">
                    Explore Marketplace Now
                  </button>
                </div>
              ) : (
                filteredRentals.map(booking => {
                  const productImage = resolveImageUrl(
                    booking.product?.frontImage || 
                    (booking.product?.images && booking.product.images[0]) || 
                    (booking.product?.additionalImages && booking.product.additionalImages[0])
                  );
                  const providerName = booking.provider?.name || booking.product?.providerId?.name || (typeof booking.provider === 'object' && booking.provider?.username) || 'Authorized Provider';
                  const providerId = booking.provider?._id || (typeof booking.provider === 'string' ? booking.provider : null) || booking.product?.providerId?._id;
                  const daysDuration = Math.max(1, Math.ceil(Math.abs(new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)));

                  return (
                    <div key={booking._id} className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-[0_10px_35px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.07)] transition-all flex flex-col group">
                      {/* Product Header & Image */}
                      <div className="relative h-60 bg-slate-900 overflow-hidden">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={booking.product?.name || 'Equipment'} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                            <svg className="w-12 h-12 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs uppercase tracking-wider font-bold">Gear Preview</span>
                          </div>
                        )}

                        {/* Top Overlay Badges */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${
                            booking.status === 'Active' ? 'bg-emerald-600 text-white' :
                            booking.status === 'Approved' ? 'bg-blue-600 text-white' :
                            booking.status === 'Return Scheduled' ? 'bg-amber-500 text-white animate-pulse' :
                            booking.status === 'Completed' ? 'bg-slate-700 text-white' :
                            'bg-yellow-500 text-white'
                          }`}>
                            {booking.status}
                          </span>

                          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs font-bold border border-white/10">
                            {booking.product?.category || 'Specialized Gear'}
                          </span>
                        </div>

                        {/* Bottom Overlay Gradient & Title */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-5 right-5">
                          <h3 className="font-black text-white text-xl leading-snug drop-shadow-md">
                            {booking.product?.name || 'DSLR Pro Gear'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-300 font-bold">
                            <span>ID: #{booking._id.substring(0, 8).toUpperCase()}</span>
                            <span>&bull;</span>
                            <span className="text-blue-300">{daysDuration} Days Rental</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content & Details */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                        <div>
                          {/* Stepper Timeline */}
                          <BookingTimeline booking={booking} />

                          {/* 2-Column Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Provider Info & Chat */}
                            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 hover:bg-blue-50 transition-colors">
                              <p className="text-[10px] uppercase font-black text-blue-600 tracking-wider mb-1">Equipment Owner / Provider</p>
                              <p className="font-black text-slate-900 text-sm truncate" title={providerName}>{providerName}</p>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{booking.provider?.email || 'Verified Host'}</p>
                              
                              <button
                                onClick={() => handleOpenChat(providerId, booking.product?._id || booking.product)}
                                className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-black shadow-sm transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                Direct Chat With Provider
                              </button>
                            </div>

                            {/* Rental Period */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                              <div>
                                <p className="text-[10px] uppercase font-black text-emerald-600 tracking-wider mb-1">Rental Timeline</p>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Start:</span>
                                    <span className="font-black text-slate-900">{new Date(booking.startDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Return By:</span>
                                    <span className="font-black text-slate-900">{new Date(booking.endDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedReceipt(booking)}
                                className="mt-3 w-full py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-black rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Digital Rental Pass
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Financial Ledger & Actions Bottom */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Amount Paid</p>
                            <div className="flex items-baseline gap-2">
                              <p className="font-black text-slate-900 text-2xl">₹{booking.totalPrice + (booking.securityDeposit || 0)}</p>
                              <span className="text-[11px] font-bold text-emerald-600">(Includes ₹{booking.securityDeposit || 0} refundable deposit)</span>
                            </div>
                          </div>

                          {booking.status === 'Approved' && (
                            <button
                              onClick={() => handleConfirmReceived(booking._id)}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                              Confirm Product Received (Accept Delivery)
                            </button>
                          )}

                          {booking.status === 'Pending' && (
                            <div className="px-4 py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-800 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm">
                              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                              Awaiting Provider Approval
                            </div>
                          )}

                          {booking.status === 'Active' && (
                            <button
                              onClick={() => handleReturn(booking._id)}
                              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              Initiate Return &amp; Refund
                            </button>
                          )}

                          {booking.status === 'Return Scheduled' && (
                            <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                              Gear In Return Transit &bull; Awaiting Provider Check For Instant Deposit Refund
                            </div>
                          )}

                          {booking.status === 'Completed' && (
                            <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                              Returned &bull; ₹{booking.securityDeposit} Deposit Auto-Refunded to UPI {booking.refundUpiId ? `(${booking.refundUpiId})` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: PROVIDER FLEET & ORDER FULFILLMENT ----------------- */}
        {activeTab === 'provider' && (
          <div className="space-y-10">
            {/* Provider KPI Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <p className="text-xs font-black uppercase tracking-wider text-indigo-200 mb-2">Total Settled Revenue</p>
                <p className="text-4xl font-black">₹{providerEarnings}</p>
                <p className="text-xs text-indigo-200/80 mt-2 font-medium">Automatic direct settlement via Equipora Ledger</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Active Deployments</p>
                <p className="text-4xl font-black text-emerald-600">
                  {providerOrders.filter(b => b.status === 'Active').length}
                  <span className="text-sm text-slate-400 font-bold ml-2">items currently in field</span>
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">Backed by active security deposits</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">My Equipment Catalog</p>
                  <p className="text-4xl font-black text-blue-600">{myProducts.length} <span className="text-sm text-slate-400 font-bold">listings</span></p>
                </div>
                <button onClick={() => navigate('/add-product')} className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/20 transition-all">
                  + Add New Equipment
                </button>
              </div>
            </div>

            {/* Provider Orders Management */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Order Requests &amp; Fulfillment</h3>
                  <p className="text-xs text-slate-500 mt-1">Review renter requests, confirm equipment handovers, and track returns.</p>
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl shadow-sm">
                  {providerOrders.length} Total Orders
                </span>
              </div>

              <div className="p-6 divide-y divide-slate-100">
                {providerOrders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium">
                    No orders have been placed for your equipment yet.
                  </div>
                ) : (
                  providerOrders.map(booking => (
                    <div key={booking._id} className="py-6 first:pt-0 last:pb-0 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      {/* Left: Product & Renter */}
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                          {resolveImageUrl(booking.product?.frontImage || (booking.product?.images && booking.product.images[0])) ? (
                            <img 
                              src={resolveImageUrl(booking.product?.frontImage || (booking.product?.images && booking.product.images[0]))} 
                              alt="Equipment" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">Gear</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-base">{booking.product?.name || 'Equipment'}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                            <span>Renter: <strong className="text-slate-900">{booking.renter?.name || 'Customer'}</strong></span>
                            <span>&bull;</span>
                            <span>Phone: <strong className="text-slate-700">{booking.renter?.phone || 'N/A'}</strong></span>
                            <span>&bull;</span>
                            <span className="text-indigo-600 font-bold">₹{booking.totalPrice} Earned</span>
                          </div>
                          <button
                            onClick={() => handleOpenChat(booking.renter?._id || booking.renter, booking.product?._id || booking.product)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            Direct Message Renter
                          </button>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Return Scheduled' ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {booking.status}
                        </span>

                        {booking.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateProviderStatus(booking._id, 'Approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl shadow-sm transition-all"
                            >
                              Approve Request
                            </button>
                            <button
                              onClick={() => updateProviderStatus(booking._id, 'Rejected')}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase rounded-xl transition-all"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {booking.status === 'Approved' && (
                          <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-xs text-blue-700 font-black uppercase tracking-wider">
                              Approved &bull; Awaiting Renter To Confirm Receipt
                            </span>
                          </div>
                        )}

                        {booking.status === 'Return Scheduled' && (
                          <button
                            onClick={() => updateProviderStatus(booking._id, 'Completed')}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            Confirm Item Received Back (Auto-Refund Deposit &amp; Disburse Payout)
                          </button>
                        )}

                        {booking.status === 'Completed' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase rounded-xl">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            Returned &amp; Settled &bull; Payout Disbursed
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My Listed Equipment Fleet Showcase */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">My Equipment Fleet ({myProducts.length})</h3>
                  <p className="text-xs text-slate-500 mt-1">Equipments listed under your provider profile in the marketplace.</p>
                </div>
                <button onClick={() => navigate('/add-product')} className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase rounded-xl shadow-sm transition-all">
                  + Add Item
                </button>
              </div>

              {myProducts.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                  You haven't listed any equipment yet. Click "+ Add Item" to publish your gear.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myProducts.map(prod => (
                    <div key={prod._id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all">
                      <div>
                        <div className="h-36 bg-slate-200 rounded-xl overflow-hidden mb-3">
                          <img 
                            src={resolveImageUrl(prod.frontImage || (prod.images && prod.images[0])) || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400'} 
                            alt={prod.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <h4 className="font-black text-slate-900 text-sm truncate">{prod.name}</h4>
                        <p className="text-xs text-slate-500">{prod.category} &bull; {prod.subCategory || 'General'}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black">Price / Day</p>
                          <p className="font-black text-blue-600 text-sm">₹{prod.pricePerDay}</p>
                        </div>
                        <button onClick={() => navigate(`/products/${prod._id}`)} className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-sm transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: ESCROW VAULT & DIGITAL TRUST PASSPORT ----------------- */}
        {activeTab === 'trust' && (
          <div className="space-y-8">
            {/* Escrow Guarantee Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 p-8 rounded-3xl relative overflow-hidden shadow-sm">
              <div className="max-w-2xl">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-200">
                  Equipora Escrow Safeguard
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">100% Guaranteed Deposit Protection</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Security deposits are held in cryptographic simulated escrow until the physical equipment passes the digital return inspection. When the item is handed over without unauthorized damage, your security deposit is instantly released.
                </p>
              </div>
            </div>

            {/* Verification Timeline */}
            <VerificationTimeline kycStatus={user.kycStatus} />

            {/* KYC Upload Desk if Not Verified */}
            {user.kycStatus === 'Basic Verified' && (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Complete Full Identity Verification
                </h3>
                <p className="text-slate-500 text-xs mb-6">Fully verified members get unlocked access to high-value lenses, cinema gear, and reduced security deposit requirements.</p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const file = e.target.idDocument.files[0];
                  const selfie = e.target.selfie.files[0];
                  if (!file || !selfie) return alert("Please select both ID document and Selfie photo.");
                  const fd = new FormData();
                  fd.append('idDocument', file);
                  fd.append('selfie', selfie);
                  try {
                    await api.post('/users/kyc', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    alert('KYC submitted successfully! Under review.');
                    window.location.reload();
                  } catch (err) { alert('Failed to submit documents.'); }
                }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <label className="block text-xs uppercase font-black text-slate-700 mb-2">Govt ID Proof (Aadhaar / Passport / Driving License)</label>
                    <input name="idDocument" type="file" accept="image/*" required className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <label className="block text-xs uppercase font-black text-slate-700 mb-2">Live Verification Selfie</label>
                    <input name="selfie" type="file" accept="image/*" capture="user" required className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all">
                      Submit Documents Securely
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ===================== DIGITAL PASS / RECEIPT MODAL ===================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-8 relative shadow-2xl overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Header */}
            <div className="border-b border-slate-100 pb-5 mb-5">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider rounded-xl border border-blue-200">
                Equipora Verified Rental Pass
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedReceipt.product?.name || 'Equipment'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Booking Pass: #{selectedReceipt._id.toUpperCase()}</p>
            </div>

            {/* Body Info */}
            <div className="space-y-4 text-xs font-medium">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Renter:</span>
                <span className="text-slate-900 font-bold">{user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Provider:</span>
                <span className="text-slate-900 font-bold">{selectedReceipt.provider?.name || selectedReceipt.product?.providerId?.name || 'Authorized Provider'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Rental Duration:</span>
                <span className="text-slate-900 font-bold">{new Date(selectedReceipt.startDate).toLocaleDateString()} &mdash; {new Date(selectedReceipt.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Base Rental Fee:</span>
                <span className="text-slate-900 font-bold">₹{selectedReceipt.totalPrice}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Refundable Deposit:</span>
                <span className="text-emerald-600 font-black">₹{selectedReceipt.securityDeposit} (Escrow Protected)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 pt-3">
                <span className="text-slate-700 font-bold uppercase text-[11px]">Total Paid:</span>
                <span className="text-slate-900 font-black text-base">₹{selectedReceipt.totalPrice + selectedReceipt.securityDeposit}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Payment ID:</span>
                <span className="text-slate-600 font-mono text-[10px]">{selectedReceipt.paymentId || 'RAZORPAY_TEST_PAID'}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                onClick={() => window.print()}
                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
