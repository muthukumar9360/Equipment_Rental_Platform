import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BACKEND_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5024/api').replace('/api', '');
const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `${BACKEND_BASE}${img.startsWith('/') ? '' : '/'}${img}`;
};

const PaymentHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'RENTALS' | 'REFUNDS' | 'PAYOUTS'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.get('/bookings/my-payments')
        .then(res => setPayments(res.data || []))
        .catch(err => console.error("Error fetching payment history:", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Aggregate Computations
  const totalSpent = payments
    .filter(b => b.renter === user?._id || b.renter?._id === user?._id)
    .reduce((sum, b) => sum + (b.totalPrice || 0) + (b.securityDeposit || 0), 0);

  const totalRefunded = payments
    .filter(b => (b.renter === user?._id || b.renter?._id === user?._id) && b.refundStatus === 'Completed')
    .reduce((sum, b) => sum + (b.refundAmount || b.securityDeposit || 0), 0);

  const totalPayouts = payments
    .filter(b => (b.provider === user?._id || b.provider?._id === user?._id) && b.providerPayoutStatus === 'Completed')
    .reduce((sum, b) => sum + (b.providerPayoutAmount || b.totalPrice || 0), 0);

  // Filter transactions
  const filteredList = payments.filter(item => {
    const isRenter = item.renter === user?._id || item.renter?._id === user?._id;
    const isProvider = item.provider === user?._id || item.provider?._id === user?._id;

    if (filterType === 'RENTALS' && !isRenter) return false;
    if (filterType === 'REFUNDS' && (!isRenter || item.refundStatus !== 'Completed')) return false;
    if (filterType === 'PAYOUTS' && (!isProvider || item.providerPayoutStatus !== 'Completed')) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.product?.name?.toLowerCase().includes(q);
      const matchId = item._id?.toLowerCase().includes(q);
      const matchPay = item.paymentId?.toLowerCase().includes(q) || item.refundTxnId?.toLowerCase().includes(q);
      return matchName || matchId || matchPay;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 text-slate-800">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-8 lg:px-12 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Razorpay Secure Ledger
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            Payment &amp; Refund Ledger
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
            Track all your rental transactions, automated UPI security deposit returns, and provider payouts with verifiable cryptographic transaction IDs.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Spent on Rent</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">₹</span>
          </div>
          <p className="text-3xl font-black text-slate-900">₹{totalSpent}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Rent + refundable deposits held</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Deposits Refunded</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-600">₹{totalRefunded}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Auto-credited to your registered UPI</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-600">Provider Earnings Received</span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">💳</span>
          </div>
          <p className="text-3xl font-black text-purple-600">₹{totalPayouts}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Disbursed directly upon gear return</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by gear name, payment ID, or txn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-[11px] font-black uppercase text-slate-400 mr-2">Filter:</span>
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'RENTALS', label: 'Rent Payments' },
              { id: 'REFUNDS', label: 'Deposit Refunds' },
              { id: 'PAYOUTS', label: 'Provider Payouts' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Transaction History ({filteredList.length})</h2>

          {loading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs">Loading ledger records...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
              <p className="font-bold text-slate-700">No payment transactions match this filter</p>
              <p className="text-xs mt-1">Book an equipment or complete a rental to generate transaction receipts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map(item => {
                const isRenter = item.renter === user?._id || item.renter?._id === user?._id;
                const isProvider = item.provider === user?._id || item.provider?._id === user?._id;
                const prodImg = resolveImageUrl(item.product?.frontImage || (item.product?.images && item.product.images[0]));

                return (
                  <div key={item._id} className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white hover:shadow-md transition-all">
                    
                    {/* Left: Product & Details */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-200 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        {prodImg ? (
                          <img src={prodImg} alt="Gear" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">Gear</div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isRenter ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {isRenter ? 'Customer Rental' : 'Provider Fleet Settlement'}
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">
                            #{item._id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="font-black text-slate-900 text-sm">{item.product?.name || 'Equipment'}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {new Date(item.startDate).toLocaleDateString()} &mdash; {new Date(item.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Gateway & Status */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-slate-700">Payment: Razorpay Secure</span>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">({item.paymentId || 'RAZORPAY_PAID'})</span>
                      </div>

                      {item.refundStatus === 'Completed' && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                          <span>✓ Auto-Refunded Deposit: ₹{item.refundAmount || item.securityDeposit}</span>
                          <span className="text-slate-400 font-mono">({item.refundTxnId})</span>
                        </div>
                      )}

                      {isProvider && item.providerPayoutStatus === 'Completed' && (
                        <div className="flex items-center gap-1.5 text-purple-600 font-bold text-[11px]">
                          <span>✓ Payout Disbursed: ₹{item.providerPayoutAmount || item.totalPrice}</span>
                          <span className="text-slate-400 font-mono">({item.providerPayoutTxnId})</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Amounts & Receipt Button */}
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                      <div className="text-right">
                        <p className="text-base font-black text-slate-900">
                          ₹{isRenter ? (item.totalPrice + (item.securityDeposit || 0)) : item.totalPrice}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {isRenter ? `Base: ₹${item.totalPrice} + Deposit: ₹${item.securityDeposit || 0}` : 'Settled Earnings'}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-black rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Receipt
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-8 relative shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="border-b border-slate-100 pb-5 mb-5">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-200">
                Official Razorpay Payment Receipt
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedReceipt.product?.name || 'Equipment'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Booking Ref: #{selectedReceipt._id.toUpperCase()}</p>
            </div>

            <div className="space-y-3.5 text-xs font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Rental Duration:</span>
                <span className="text-slate-900 font-bold">{new Date(selectedReceipt.startDate).toLocaleDateString()} &mdash; {new Date(selectedReceipt.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Base Equipment Rental:</span>
                <span className="text-slate-900 font-bold">₹{selectedReceipt.totalPrice}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Security Deposit:</span>
                <span className="text-emerald-600 font-black">₹{selectedReceipt.securityDeposit} (Escrow Protected)</span>
              </div>

              {selectedReceipt.refundStatus === 'Completed' && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 bg-emerald-50/60 px-2 rounded-lg">
                  <span className="text-emerald-800 font-bold">Deposit Auto-Refunded:</span>
                  <span className="text-emerald-700 font-mono font-bold">₹{selectedReceipt.refundAmount} (Ref: {selectedReceipt.refundTxnId})</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-slate-200 pt-2 font-black text-sm">
                <span className="text-slate-800 uppercase text-xs">Total Transaction Value:</span>
                <span className="text-slate-900">₹{selectedReceipt.totalPrice + (selectedReceipt.securityDeposit || 0)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-400 font-mono text-[10px]">
                <span>Razorpay Gateway ID:</span>
                <span>{selectedReceipt.paymentId || 'RAZORPAY_TEST_PAID'}</span>
              </div>
            </div>

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
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentHistory;
