import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans animate-fade-in">
      <div className="max-w-[90rem] mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h2>
            <p className="text-gray-500 mt-1">Central command for user identities and platform inventory.</p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-xl mb-6 overflow-x-auto w-fit max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-24 flex flex-col items-center justify-center space-y-5 bg-gray-50/50">
              <div className="relative w-16 h-16">
                {/* Background Ring */}
                <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
                {/* Outer Spinning Ring */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-gray-900 border-r-gray-900 animate-spin"></div>
                {/* Inner Pulsating Dot */}
                <div className="absolute inset-4 bg-gray-900 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] animate-pulse"></div>
              </div>
              <p className="text-gray-900 font-black tracking-widest text-xs uppercase animate-pulse">Loading Data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              
              {/* TAB 1: PENDING USERS (KYC) */}
              {activeTab === 'pending-kyc' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipora ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingUsers.map(u => (
                      <tr key={u._id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="font-mono font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">{u.equiporaId}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500 mt-0.5">@{u.username}</div>
                          <div className="text-xs text-green-700 font-medium mt-1.5 flex gap-2">
                            {u.emailVerified && <span className="flex items-center gap-1">Email</span>} 
                            {u.mobileVerified && <span className="flex items-center gap-1">Mobile</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {u.kycData?.primaryDocumentType || 'N/A'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
                            {u.kycStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => { setSelectedUser(u); setActionReason(''); }} className="text-blue-700 bg-white border border-gray-300 hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
                            Review Identity
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingUsers.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500 font-medium">Queue is empty.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 2: PENDING PRODUCTS */}
              {activeTab === 'pending-products' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingProducts.map(p => (
                      <tr key={p._id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <img src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0].startsWith('/') ? '' : '/'}${p.images[0]}`) : 'https://via.placeholder.com/150'} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{p.brand} {p.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                          {p.providerId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">₹{p.pricePerDay}/day</div>
                          <div className="text-xs text-gray-500">Dep: ₹{p.securityDeposit}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full border bg-orange-50 text-orange-700 border-orange-200">
                            Pending Review
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => { setSelectedProduct(p); setActionReason(''); }} className="text-blue-700 bg-white border border-gray-300 hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
                            Review Product
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingProducts.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500 font-medium">No products pending approval.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 3: ALL USERS */}
              {activeTab === 'users' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map(u => (
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
                  </tbody>
                </table>
              )}

              {/* TAB 4: ALL PRODUCTS */}
              {activeTab === 'products' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/Day</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allProducts.map(p => (
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
                  </tbody>
                </table>
              )}

            </div>
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
