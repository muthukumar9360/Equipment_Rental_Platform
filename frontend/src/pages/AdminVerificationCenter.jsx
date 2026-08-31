import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('pending-kyc');
  const [loading, setLoading] = useState(true);
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  
  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDataForTab();
  }, [user, activeTab]);

  const fetchDataForTab = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending-kyc') {
        const { data } = await api.get('/admin/verifications/pending');
        setPendingUsers(data);
      } else if (activeTab === 'pending-products') {
        const { data } = await api.get('/admin/products?status=Pending');
        setPendingProducts(data);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/admin/users');
        setAllUsers(data);
      } else if (activeTab === 'products') {
        const { data } = await api.get('/admin/products');
        setAllProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserReview = async (newStatus) => {
    if ((newStatus === 'REJECTED' || newStatus === 'MORE_INFO_REQUIRED' || newStatus === 'SUSPENDED') && !actionReason) {
      alert(`Please provide a reason for ${newStatus}`);
      return;
    }
    
    try {
      await api.post('/admin/verifications/review', {
        userId: selectedUser._id,
        newStatus,
        reason: actionReason
      });
      setSelectedUser(null);
      setActionReason('');
      fetchDataForTab();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleProductReview = async (newStatus) => {
    if ((newStatus === 'Rejected' || newStatus === 'Manual Review Required') && !actionReason) {
      alert(`Please provide a reason for ${newStatus}`);
      return;
    }
    
    try {
      await api.post('/admin/products/review', {
        productId: selectedProduct._id,
        newStatus,
        reason: actionReason
      });
      setSelectedProduct(null);
      setActionReason('');
      fetchDataForTab();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${selectedUser._id}`);
      setSelectedUser(null);
      fetchDataForTab();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product permanently?')) return;
    try {
      await api.delete(`/admin/products/${selectedProduct._id}`);
      setSelectedProduct(null);
      fetchDataForTab();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  const tabs = [
    { id: 'pending-kyc', label: 'Identity Verifications', count: activeTab === 'pending-kyc' ? pendingUsers.length : null },
    { id: 'pending-products', label: 'Product Approvals', count: activeTab === 'pending-products' ? pendingProducts.length : null },
    { id: 'users', label: 'All Users' },
    { id: 'products', label: 'All Products' },
  ];

  const getFilteredData = () => {
    let data = [];
    if (activeTab === 'pending-kyc') data = pendingUsers;
    else if (activeTab === 'pending-products') data = pendingProducts;
    else if (activeTab === 'users') data = allUsers;
    else if (activeTab === 'products') data = allProducts;

    if (!searchTerm) return data;

    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(item => {
      if (activeTab === 'users' || activeTab === 'pending-kyc') {
        return (
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.username?.toLowerCase().includes(lowerSearch) ||
          item.equiporaId?.toLowerCase().includes(lowerSearch) ||
          item.email?.toLowerCase().includes(lowerSearch)
        );
      } else {
        return (
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.brand?.toLowerCase().includes(lowerSearch) ||
          item.model?.toLowerCase().includes(lowerSearch) ||
          item.providerId?.username?.toLowerCase().includes(lowerSearch) ||
          item.providerId?.name?.toLowerCase().includes(lowerSearch)
        );
      }
    });
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-gray-50 to-blue-50/40 py-10 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="max-w-[100rem]">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight drop-shadow-sm">Admin Dashboard</h2>
            <p className="text-gray-500 font-medium mt-1">Central command for user identities and platform inventory.</p>
          </div>
          <div className="w-full md:w-96 relative">
            <input 
              type="text" 
              placeholder="Search by name, ID, or provider username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex space-x-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl mb-8 overflow-x-auto w-fit max-w-full shadow-sm border border-white/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-[1.02]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden flex flex-col h-[800px] relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader type="section" text="Loading Data..." />
            </div>
          ) : (
            <>
              <div className="overflow-y-auto overflow-x-auto flex-grow relative">
              
              {/* TAB 1: PENDING USERS (KYC) */}
              {activeTab === 'pending-kyc' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {currentItems.map(u => (
                      <div key={u._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-blue-600 flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex-grow w-full">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{u.name}</h4>
                              <p className="text-sm text-gray-500">@{u.username}</p>
                            </div>
                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                              {u.equiporaId}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200 uppercase tracking-wider">
                              {u.kycStatus.replace('_', ' ')}
                            </span>
                            <span className="px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                              DOC: {u.kycData?.primaryDocumentType || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 w-full">
                            <button 
                              onClick={() => { setSelectedUser(u); setActionReason(''); }} 
                              className="flex-1 py-2.5 bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white text-sm font-bold rounded-xl transition-colors border border-gray-100 shadow-sm"
                            >
                              Review Identity
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {currentItems.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      <h3 className="text-lg font-bold text-gray-900">No Pending KYC</h3>
                      <p className="text-sm text-gray-500 mt-1">There are no identity verifications waiting in the queue.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PENDING PRODUCTS */}
              {activeTab === 'pending-products' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentItems.map(p => (
                      <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col group">
                        <div className="h-48 relative overflow-hidden bg-gray-100">
                          <img 
                            src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0].startsWith('/') ? '' : '/'}${p.images[0]}`) : 'https://via.placeholder.com/400'} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div>
                              <h4 className="text-white font-bold text-lg line-clamp-1 drop-shadow-md">{p.name}</h4>
                              <p className="text-white/80 text-xs font-medium">{p.brand} {p.model}</p>
                            </div>
                            <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                              Pending Review
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Provider</p>
                              <p className="text-sm font-bold text-gray-900">{p.providerId?.name || 'Unknown'}</p>
                              <p className="text-xs text-blue-600 font-medium">@{p.providerId?.username || 'unknown'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Pricing</p>
                              <p className="text-lg font-black text-gray-900">₹{p.pricePerDay}<span className="text-xs text-gray-500 font-normal">/day</span></p>
                              <p className="text-xs text-gray-500 font-medium">Dep: ₹{p.securityDeposit}</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => { setSelectedProduct(p); setActionReason(''); }} 
                            className="w-full py-3 bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white font-bold rounded-xl transition-colors border border-gray-100 shadow-sm"
                          >
                            Review Product
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {currentItems.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      <h3 className="text-lg font-bold text-gray-900">No Products Pending</h3>
                      <p className="text-sm text-gray-500 mt-1">There are no products waiting for approval right now.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ALL USERS */}
              {activeTab === 'users' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">KYC Status</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                      <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{u.role.toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.kycStatus === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{u.kycStatus.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => { setSelectedUser(u); setActionReason(''); }} className="text-blue-700 hover:text-blue-900 font-semibold">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500 font-medium">No results found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 4: ALL PRODUCTS */}
              {activeTab === 'products' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Price/Day</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.brand}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{p.pricePerDay}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${p.verificationStatus === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{p.verificationStatus}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => { setSelectedProduct(p); setActionReason(''); }} className="text-blue-700 hover:text-blue-900 font-semibold">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500 font-medium">No results found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-8 py-5 bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center justify-between mt-auto flex-shrink-0 z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                <span className="text-sm text-gray-500 font-medium">
                  Showing <span className="font-black text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-black text-gray-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-black text-gray-900">{filteredData.length}</span> results
                </span>
                <div className="flex space-x-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Prev
                  </button>
                  {getPageNumbers().map((num, i) => (
                    <button
                      key={i}
                      disabled={num === '...'}
                      onClick={() => num !== '...' && setCurrentPage(num)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        currentPage === num 
                          ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-600/20' 
                          : num === '...' 
                            ? 'text-gray-400 cursor-default shadow-none border border-transparent' 
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
          )}
        </div>
      </div>

      {/* USER REVIEW MODAL (From previous iteration) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Review Identity Application</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Applicant ID:</span>
                    <span className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{selectedUser.equiporaId}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Personal Details</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Full Name</span> <span className="font-semibold text-gray-900">{selectedUser.name}</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Username</span> <span className="font-medium text-gray-900">@{selectedUser.username}</span></div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Location Data</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-500">Address</span> <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedUser.address?.line1}</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-500">City & Dist.</span> <span className="font-medium text-gray-900">{selectedUser.address?.city}, {selectedUser.address?.district}</span></div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-full">
                    <h4 className="text-sm font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">Uploaded Documents</h4>
                    <div className="space-y-6">
                      {selectedUser.kycData?.documentUrls?.map((doc, idx) => (
                        <div key={idx} className="group">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">{doc.docType}</span>
                          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden border border-gray-300 relative flex items-center justify-center">
                            <img 
                              src={`http://localhost:5000${doc.url.startsWith('/') ? '' : '/'}${doc.url}`} 
                              alt={doc.docType} 
                              className="w-full h-full object-cover"
                            />
                            <div 
                              onClick={() => setPreviewImage(`http://localhost:5000${doc.url.startsWith('/') ? '' : '/'}${doc.url}`)}
                              className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                            >
                              <div className="bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg shadow-sm">View Full Screen</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Admin Notes / Reason</label>
                <textarea 
                  value={actionReason} 
                  onChange={e => setActionReason(e.target.value)}
                  className="w-full bg-white px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 mb-6"
                  rows="2"
                ></textarea>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button onClick={() => setSelectedUser(null)} className="px-5 py-2.5 bg-white border border-gray-300 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={handleDeleteUser} className="px-5 py-2.5 bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Delete User</button>
                  <button onClick={() => handleUserReview('REJECTED')} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700">Reject</button>
                  <button onClick={() => handleUserReview('ACTIVE')} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">Approve Application</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT REVIEW MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Review Product Listing</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Provider:</span>
                    <span className="font-semibold text-gray-900">{selectedProduct.providerId?.name || 'Unknown'}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-full">
                    <h4 className="text-sm font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">Product Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProduct.images?.map((imgUrl, idx) => {
                        const cleanUrl = imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
                        return (
                          <div key={idx} className="aspect-square bg-gray-200 rounded-xl overflow-hidden border border-gray-300 relative group">
                            <img src={cleanUrl} alt="" className="w-full h-full object-cover" />
                            <div 
                              onClick={() => setPreviewImage(cleanUrl)}
                              className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                              <span className="text-white text-xs font-semibold bg-gray-900/80 px-2 py-1 rounded">Expand</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Listing Details</h4>
                    <div className="space-y-3">
                      <div><span className="text-sm text-gray-500 block">Name</span><span className="font-semibold text-gray-900">{selectedProduct.name}</span></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-sm text-gray-500 block">Brand</span><span className="font-medium text-gray-900">{selectedProduct.brand}</span></div>
                        <div><span className="text-sm text-gray-500 block">Category</span><span className="font-medium text-gray-900">{selectedProduct.category}</span></div>
                        <div><span className="text-sm text-gray-500 block">Price/Day</span><span className="font-bold text-green-700">₹{selectedProduct.pricePerDay}</span></div>
                        <div><span className="text-sm text-gray-500 block">Deposit</span><span className="font-medium text-gray-900">₹{selectedProduct.securityDeposit}</span></div>
                      </div>
                      <div><span className="text-sm text-gray-500 block">Description</span><p className="text-sm text-gray-700 mt-1">{selectedProduct.description}</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Admin Notes / Reason</label>
                <textarea 
                  value={actionReason} 
                  onChange={e => setActionReason(e.target.value)}
                  className="w-full bg-white px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 mb-6"
                  rows="2"
                  placeholder="e.g. Images are blurry."
                ></textarea>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button onClick={() => setSelectedProduct(null)} className="px-5 py-2.5 bg-white border border-gray-300 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                  <button onClick={handleDeleteProduct} className="px-5 py-2.5 bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Delete Product</button>
                  <button onClick={() => handleProductReview('Rejected')} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700">Reject Listing</button>
                  <button onClick={() => handleProductReview('Verified')} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">Approve & Publish</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] bg-gray-900/95 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition-colors p-2 focus:outline-none"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl animate-slide-up" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
