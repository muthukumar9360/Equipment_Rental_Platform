import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const CustomerSupport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation Tabs: 'desk' | 'tickets' | 'faq'
  const [activeTab, setActiveTab] = useState('desk');

  // Bookings & Form State
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [category, setCategory] = useState('Network Error During Payment');
  const [transactionId, setTransactionId] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedTicketId, setCopiedTicketId] = useState('');

  // Live Bot Chat & Active Ticket State
  const [activeTicket, setActiveTicket] = useState(null);
  const [userReply, setUserReply] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [isQuickInquiriesOpen, setIsQuickInquiriesOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Interactive Visual Categories with Custom Icons & Themes
  const issueCategories = [
    {
      id: 'Network Error During Payment',
      title: 'Network / Gateway Error',
      tagline: 'Checkout timeout or gateway drop',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'blue',
      defaultDesc: 'I encountered an unexpected network interruption/timeout during Razorpay checkout while paying for the equipment.'
    },
    {
      id: 'Amount Debited But Booking Unconfirmed',
      title: 'Amount Debited, Status Pending',
      tagline: 'Money deducted from UPI/Bank',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'amber',
      defaultDesc: 'Payment was debited from my bank/UPI app, but the booking status on Equipora still shows pending.'
    },
    {
      id: 'Security Deposit Refund Query',
      title: 'Deposit Auto-Refund Status',
      tagline: 'Automated UPI return verification',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'emerald',
      defaultDesc: 'I returned the gear and need to verify the automated Razorpay security deposit refund to my registered UPI ID.'
    },
    {
      id: 'Product Delivery / Handover Issue',
      title: 'Handover & Pickup Delay',
      tagline: 'Coordination with provider',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'purple',
      defaultDesc: 'The provider is delayed or unresponsive regarding equipment handover location.'
    },
    {
      id: 'Damaged or Malfunctioning Gear',
      title: 'Gear Condition & Inspection',
      tagline: 'Hardware malfunction / dispute',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'rose',
      defaultDesc: 'The equipment delivered has physical damage or functional flaws that were not disclosed.'
    },
    {
      id: 'General Payment & Account Issue',
      title: 'General Account Support',
      tagline: 'Profile, KYC, or ledger inquiry',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'slate',
      defaultDesc: 'I have a general query regarding my account verification, payouts, or KYC status.'
    }
  ];

  // Smart Prompt Chips for Quick Chatting
  const smartChips = [
    'What is the bank auto-reversal timeline?',
    'How do I track my security deposit refund?',
    'Verify my Razorpay transaction ID',
    'Will duplicate charges be reversed automatically?',
    'How does provider handover confirmation work?'
  ];

  // Frequently Asked Questions
  const faqItems = [
    {
      q: 'What happens if my money was debited but the screen timed out?',
      a: 'This is a standard gateway network timeout. Our automated webhook listener synchronizes with Razorpay every 5 minutes. If captured, your booking is confirmed automatically. If the bank switch interrupted the call, 100% of the funds will be automatically credited back to your source account within 2 hours by NPCI.'
    },
    {
      q: 'Do I need admin approval for my security deposit refund?',
      a: 'No! Equipora features a 100% automated refund pipeline. Once you return the equipment and the provider clicks "Confirm Item Received", your deposit is immediately disbursed to your registered UPI ID via Razorpay with zero manual delay.'
    },
    {
      q: 'How do I upload a screenshot of my bank debit SMS or UPI receipt?',
      a: 'Simply tap the "Upload Payment Proof" box on the AI Diagnostic Desk. Attach your screenshot (PNG/JPG) and enter your 12-digit Bank UTR or Razorpay Payment ID. Our bot cross-checks the gateway log instantly.'
    },
    {
      q: 'Where can I see all my completed transactions and refunds?',
      a: 'You can navigate to the dedicated Payments page (/payments) to see full itemized breakdowns of rent paid, security deposits auto-refunded to UPI, and provider payouts.'
    }
  ];

  useEffect(() => {
    if (user) {
      // Fetch bookings for gear selector
      api.get('/bookings')
        .then(res => setBookings(res.data || []))
        .catch(err => console.error("Error fetching bookings:", err));

      // Fetch user's support tickets
      fetchTickets();
    }
  }, [user]);

  // Auto-scroll chat window when new message arrives or bot types
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.chatHistory, isBotTyping]);

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await api.get('/support/my-tickets');
      setMyTickets(res.data || []);
      if (res.data && res.data.length > 0 && !activeTicket) {
        setActiveTicket(res.data[0]);
      }
    } catch (e) {
      console.error("Error fetching tickets:", e);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Screenshot must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectCategory = (cat) => {
    setCategory(cat.id);
    if (!description || issueCategories.some(c => c.defaultDesc === description)) {
      setDescription(cat.defaultDesc);
    }
  };

  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    if (!description.trim() && !category) {
      alert("Please provide problem details.");
      return;
    }

    setSubmitting(true);
    setIsBotTyping(true);

    try {
      const selectedBooking = bookings.find(b => b._id === selectedBookingId);
      const payload = {
        category,
        bookingId: selectedBookingId || undefined,
        productId: selectedBooking?.product?._id || undefined,
        transactionId: transactionId.trim() || undefined,
        description,
        screenshotUrl: screenshotPreview || undefined
      };

      const { data } = await api.post('/support/tickets', payload);
      setActiveTicket(data);
      setMyTickets(prev => [data, ...prev]);
      
      // Reset form
      setDescription('');
      setTransactionId('');
      setScreenshotPreview(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit support issue");
    } finally {
      setSubmitting(false);
      setIsBotTyping(false);
    }
  };

  const handleSendReply = async (messageText) => {
    const msg = messageText || userReply;
    if (!msg || !msg.trim() || !activeTicket) return;

    setUserReply('');
    setIsBotTyping(true);

    // Optimistic user message in chat
    setActiveTicket(prev => ({
      ...prev,
      chatHistory: [
        ...(prev?.chatHistory || []),
        { sender: 'user', message: msg, timestamp: new Date() }
      ]
    }));

    try {
      const { data } = await api.post(`/support/tickets/${activeTicket._id}/reply`, { message: msg });
      setActiveTicket(data);
      setMyTickets(prev => prev.map(t => t._id === data._id ? data : t));
    } catch (e) {
      console.error("Error sending reply:", e);
    } finally {
      setIsBotTyping(false);
    }
  };

  const copyTicketId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedTicketId(id);
    setTimeout(() => setCopiedTicketId(''), 2500);
  };

  const filteredTickets = myTickets.filter(t => {
    if (ticketFilter === 'resolved') return t.status === 'Resolved';
    if (ticketFilter === 'pending') return t.status !== 'Resolved';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Sleek Modern Header with Glass Aesthetics & Trust KPIs */}
      <div className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mr-5">AI Resolution Command Hub</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-2"></span>
                  Live 24/7
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Automated Razorpay gateway diagnosis, instant UPI deposit verification &amp; 2h reversal SLA
              </p>
            </div>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('desk')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                activeTab === 'desk'
                  ? 'bg-white text-blue-600 shadow-sm shadow-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⚡</span>
              <span>AI Diagnostic Desk</span>
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-white text-blue-600 shadow-sm shadow-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋</span>
              <span>My Tickets</span>
              {myTickets.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                  {myTickets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                activeTab === 'faq'
                  ? 'bg-white text-blue-600 shadow-sm shadow-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💡</span>
              <span>Help &amp; FAQ</span>
            </button>
          </div>

        </div>
      </div>

      {/* Trust SLA Highlights Strip */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center space-x-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm flex-shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Gateway Timeout SLA</p>
              <p className="text-xs font-bold text-slate-800">Auto-Reversal within 2 Hours</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center space-x-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm flex-shrink-0">
              ✓
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Zero Admin Delays</p>
              <p className="text-xs font-bold text-slate-800">100% Automated UPI Deposit Returns</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center space-x-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm flex-shrink-0">
              🤖
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">AI Diagnostics</p>
              <p className="text-xs font-bold text-slate-800">Instant Automated Ledger Audit</p>
            </div>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: AI DIAGNOSTIC DESK */}
      {activeTab === 'desk' && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

            {/* Left Column: Visual Diagnostic Wizard (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      Step 1 of 3
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-2">Classify Your Issue</h2>
                    <p className="text-xs text-slate-500 font-medium">Select an issue tile to load diagnostic intelligence</p>
                  </div>
                  <span className="text-2xl">🎯</span>
                </div>

                {/* Visual Category Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {issueCategories.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => selectCategory(cat)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 shadow-xs'
                          }`}>
                            {cat.icon}
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="mt-2.5">
                          <h4 className={`text-xs font-black ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                            {cat.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                            {cat.tagline}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Form Inputs: Equipment Linker, UTR, Proof, Description */}
                <form onSubmit={handleSubmitIssue} className="space-y-5 pt-2 border-t border-slate-100">
                  
                  {/* Unique Equipment & Rental Context Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                          📦
                        </span>
                        <label className="text-xs font-black uppercase text-slate-800 tracking-wider">
                          Linked Equipment &amp; Rental Context
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">(Optional)</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {bookings.length} {bookings.length === 1 ? 'Rental Available' : 'Rentals Available'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: General Inquiry Card */}
                      <div
                        onClick={() => setSelectedBookingId('')}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative flex items-center justify-between ${
                          selectedBookingId === ''
                            ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 transition-colors ${
                            selectedBookingId === ''
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                              : 'bg-white text-slate-500 border border-slate-200 shadow-2xs'
                          }`}>
                            🌐
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                General Support / Account Inquiry
                              </h4>
                              {selectedBookingId === '' && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-600 text-white flex-shrink-0">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                              Not linked to any specific equipment. AI Bot checks gateway logs and account issues globally.
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 ml-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                            selectedBookingId === ''
                              ? 'bg-blue-600 text-white ring-2 ring-blue-100'
                              : 'border-2 border-slate-300 text-transparent'
                          }`}>
                            ✓
                          </div>
                        </div>
                      </div>

                      {/* Option 2: Rich Equipment Cards */}
                      {bookings.map(b => {
                        const isSelected = selectedBookingId === b._id;
                        const imgSrc = b.product?.frontImage || b.product?.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80';

                        return (
                          <div
                            key={b._id}
                            onClick={() => setSelectedBookingId(b._id)}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                              isSelected
                                ? 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40 border-blue-600 ring-2 ring-blue-600/25 shadow-md'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left: Product Thumbnail + Meta */}
                              <div className="flex items-center space-x-3.5 min-w-0">
                                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/80 shadow-2xs">
                                  <img
                                    src={imgSrc}
                                    alt={b.product?.name || 'Equipment'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/%3E%3Ccircle cx='12' cy='13' r='4'/%3E%3C/svg%3E";
                                    }}
                                  />
                                  <span className="absolute bottom-1 right-1 text-[8px] bg-black/75 backdrop-blur-xs text-white px-1.5 py-0.5 rounded font-mono font-bold">
                                    📷
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                                    <span className="text-[10px] font-mono font-black text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                      #{b._id.slice(-6).toUpperCase()}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                      b.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                      b.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                      b.status === 'Return Scheduled' ? 'bg-amber-100 text-amber-800' :
                                      b.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                                      'bg-purple-100 text-purple-800'
                                    }`}>
                                      {b.status || 'Active'}
                                    </span>
                                    {b.securityDeposit > 0 && (
                                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                        ₹{b.securityDeposit} Deposit in Escrow
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                    {b.product?.name || 'DSLR Pro Gear 1 - Premium Quality'}
                                  </h4>

                                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium mt-1 flex-wrap">
                                    {b.startDate && b.endDate && (
                                      <span className="flex items-center">
                                        <span className="mr-1">📅</span>
                                        {new Date(b.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} → {new Date(b.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                      </span>
                                    )}
                                    {b.provider?.name && (
                                      <span className="hidden sm:inline-flex items-center text-slate-600">
                                        <span className="mr-1">👤</span> {b.provider.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Price & Selection Status */}
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex-shrink-0">
                                <div className="text-left sm:text-right">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Rental Total</span>
                                  <span className="text-sm sm:text-base font-black text-slate-900">₹{b.totalPrice}</span>
                                </div>

                                <div className="mt-0 sm:mt-2">
                                  {isSelected ? (
                                    <span className="inline-flex items-center text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                                      ✓ Linked to Audit
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[10px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                                      Tap to Link &rarr;
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Active Audit Context Callout */}
                            {isSelected && (
                              <div className="mt-3 pt-2.5 border-t border-blue-200/80 flex items-center justify-between text-[11px] text-blue-900 font-medium">
                                <span className="flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping mr-2"></span>
                                  AI Bot will cross-reference gateway webhooks, escrow, and provider timeline for this gear.
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBookingId('');
                                  }}
                                  className="text-[10px] font-black uppercase text-blue-700 hover:underline"
                                >
                                  Switch to General
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Reference & Screenshot Uploader in Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Razorpay ID / Bank UTR */}
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                        Razorpay Txn ID / Bank UTR
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. pay_N29K987 or 12-digit UTR"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Found in bank SMS or Razorpay receipt</span>
                    </div>

                    {/* Screenshot Upload Dropzone */}
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                        Debit SMS / Payment Screenshot
                      </label>
                      <div className="border border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-2.5 text-center bg-slate-50 hover:bg-white transition-all relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {screenshotPreview ? (
                          <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-emerald-600 flex items-center">
                              ✓ Screenshot Attached
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScreenshotPreview(null);
                              }}
                              className="text-[10px] text-red-500 hover:underline z-20 font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2 text-slate-500 py-1">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-bold text-slate-700">Upload Image / Receipt</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Problem Description */}
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                      Issue Description &amp; Details
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain what happened in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Auditing Gateway Logs &amp; Initializing Bot...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Run Instant AI Diagnosis &amp; Open Live Bot Chat ➔</span>
                      </>
                    )}
                  </button>

                </form>

              </div>

            </div>

            {/* Right Column: Live AI Diagnostic Chat Hub (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between min-h-[840px]">
              
              <div>
                {/* Bot Header Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
                        🤖
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-black text-slate-900 text-sm">Equipora AI Bot</h3>
                        <span className="text-[10px] font-bold text-slate-400">v2.6</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Auto-reconciliation &amp; ledger sync</p>
                    </div>
                  </div>

                  {activeTicket && (
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Ticket ID</span>
                      <button
                        onClick={() => copyTicketId(activeTicket.ticketId)}
                        className="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center"
                        title="Click to copy"
                      >
                        {activeTicket.ticketId}
                        <span className="ml-1 text-[10px]">{copiedTicketId === activeTicket.ticketId ? '✓' : '📋'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Conversation Box */}
                <div className="space-y-3.5 min-h-[540px] max-h-[540px] overflow-y-auto pr-1.5 scroll-smooth">
                  {!activeTicket ? (
                    <div className="py-16 px-4 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs">
                        💬
                      </div>
                      <h4 className="font-black text-slate-800 text-sm">AI Resolution Desk Ready</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                        Fill in your problem details on the left to start live automated diagnostics with our assistant.
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                        <span className="text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 font-bold">
                          ⚡ Network errors
                        </span>
                        <span className="text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 font-bold">
                          🔄 UPI Auto-refunds
                        </span>
                        <span className="text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 font-bold">
                          🔒 Escrow safe
                        </span>
                      </div>
                    </div>
                  ) : (
                    activeTicket.chatHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            item.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none shadow-sm shadow-blue-500/10'
                              : 'bg-slate-100/90 text-slate-800 rounded-bl-none border border-slate-200/80 shadow-xs'
                          }`}
                        >
                          {item.message}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}

                  {isBotTyping && (
                    <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-2xl w-fit text-xs text-slate-500 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      <span>AI Support Bot is analyzing ledger records...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Smart Quick Inquiries Slider Drawer (Up & Down Movement) */}
                {activeTicket && (
                  <div className="border-t border-black pt-2 transition-all duration-300">
                    {/* Drawer Toggle Bar */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsQuickInquiriesOpen(!isQuickInquiriesOpen)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 mt-2 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-[11px] font-black uppercase tracking-wider transition-all shadow-2xs group cursor-pointer mb-2"
                      >
                        <span>⚡ Quick Inquiries ({smartChips.length})</span>
                        <svg
                          className={`w-3.5 h-3.5 transform transition-transform duration-300 ${
                            isQuickInquiriesOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsQuickInquiriesOpen(!isQuickInquiriesOpen)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-bold transition-colors"
                      >
                        {isQuickInquiriesOpen ? '▲ Slide down to hide' : '▼ Slide up to view'}
                      </button>
                    </div>

                    {/* Smooth Collapsible Slider Box */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isQuickInquiriesOpen
                          ? 'max-h-35 opacity-100 mt-2 transform translate-y-0'
                          : 'max-h-0 opacity-0 pointer-events-none transform -translate-y-2'
                      }`}
                    >
                      <div className="p-2.5 bg-slate-50/90 border border-slate-200/80 shadow-inner max-h-40 overflow-y-auto space-y-2">
                        {smartChips.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleSendReply(chip);
                              setIsQuickInquiriesOpen(true); // Auto slide down so chat is never blocked!
                            }}
                            className="w-full text-left text-[11px] font-bold px-3 py-2 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center justify-between group"
                          >
                            <span className="truncate pr-2">{chip}</span>
                            <span className="text-slate-400 group-hover:text-white flex-shrink-0">&rarr;</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="pt-3 border-t border-black mt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder={
                      activeTicket
                        ? "Type follow-up question or detail..."
                        : "Submit an issue to activate AI chat..."
                    }
                    disabled={!activeTicket || isBotTyping}
                    value={userReply}
                    onChange={(e) => setUserReply(e.target.value)}
                    className="flex-grow px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!activeTicket || !userReply.trim() || isBotTyping}
                    className="px-5 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MY RESOLUTION TICKETS */}
      {activeTab === 'tickets' && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 mt-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">  
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Support &amp; Audit Tickets</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any ticket to inspect or continue diagnostics in the AI Desk</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                  <button
                    onClick={() => setTicketFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${ticketFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : ''}`}
                  >
                    All ({myTickets.length})
                  </button>
                  <button
                    onClick={() => setTicketFilter('resolved')}
                    className={`px-3 py-1 rounded-lg transition-all ${ticketFilter === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : ''}`}
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() => setTicketFilter('pending')}
                    className={`px-3 py-1 rounded-lg transition-all ${ticketFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : ''}`}
                  >
                    Pending
                  </button>
                </div>

                <button
                  onClick={fetchTickets}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase text-slate-700 transition-all"
                >
                  Refresh
                </button>
              </div>
            </div>

            {ticketsLoading ? (
              <div className="py-16 text-center text-slate-400 font-bold text-xs">
                <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
                Loading tickets from ledger...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-16 px-4 text-center border border-dashed border-slate-200 rounded-2xl">
                <span className="text-3xl block mb-2">🎉</span>
                <h4 className="font-black text-slate-800 text-sm">No Tickets Found</h4>
                <p className="text-xs text-slate-400 mt-1">All payments, bookings, and automated refunds are operating normally.</p>
                <button
                  onClick={() => setActiveTab('desk')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Create New Support Ticket
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTickets.map(t => (
                  <div
                    key={t._id}
                    onClick={() => {
                      setActiveTicket(t);
                      setActiveTab('desk');
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      activeTicket?._id === t._id
                        ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {t.ticketId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                          {t.status}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-xs truncate">{t.category}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{t.description}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">{new Date(t.createdAt).toLocaleDateString()}</span>
                      <span className="text-blue-600 font-black hover:underline">
                        Open in AI Bot Desk &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT 3: INSTANT HELP & FAQ */}
      {activeTab === 'faq' && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 mt-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            
            <div className="pb-6 border-b border-slate-100 mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Knowledge Base
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-500 font-medium">Clear answers on Razorpay network glitches, UPI refunds, and gear handover</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1.5 flex items-start">
                    <span className="text-blue-600 font-mono font-black mr-2">Q{idx + 1}.</span>
                    {item.q}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h5 className="text-xs font-black text-blue-900 uppercase tracking-wider">Still Need Assistance?</h5>
                <p className="text-xs text-blue-700 font-medium mt-0.5">Start an automated diagnostic session in the AI Resolution Desk.</p>
              </div>
              <button
                onClick={() => setActiveTab('desk')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm"
              >
                Launch AI Desk &rarr;
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerSupport;
