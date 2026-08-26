import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminVerificationCenter = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected user for review modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingUsers();
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      const { data } = await api.get('/admin/verifications/pending');
      setPendingUsers(data);
    } catch (err) {
      console.error('Failed to fetch verifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (newStatus) => {
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
      
      // Remove from list and close modal
      setPendingUsers(pendingUsers.filter(u => u._id !== selectedUser._id));
      setSelectedUser(null);
      setActionReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const openReviewModal = (u) => {
    setSelectedUser(u);
    setActionReason('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Center...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 text-gray-900 font-sans animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Verification Center</h2>
            <p className="text-gray-500 mt-1">Review and approve new user identities.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-semibold border border-blue-100 shadow-sm flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            {pendingUsers.length} Pending Reviews
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
                      {u.emailVerified && <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Email</span>} 
                      {u.mobileVerified && <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> Mobile</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {u.kycData?.primaryDocumentType || 'N/A'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${
                      u.kycStatus === 'PENDING_REVIEW' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                      u.kycStatus === 'MORE_INFO_REQUIRED' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {u.kycStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openReviewModal(u)} className="text-blue-700 bg-white border border-gray-300 hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-1">
                      Review Application
                    </button>
                  </td>
                </tr>
              ))}
              {pendingUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      Queue is empty. Great job!
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
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
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-5 space-y-6">
                  {/* Data Panels */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Personal Details
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Full Name</span> <span className="font-semibold text-gray-900">{selectedUser.name}</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Username</span> <span className="font-medium text-gray-900">@{selectedUser.username}</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Date of Birth</span> <span className="font-medium text-gray-900">{new Date(selectedUser.dob).toLocaleDateString()}</span></div>
                      <div className="flex justify-between items-center py-2"><span className="text-sm text-gray-500">Gender</span> <span className="font-medium text-gray-900 capitalize">{selectedUser.gender}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Location Data
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-500">Address</span> <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedUser.address?.line1}</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-500">City & Dist.</span> <span className="font-medium text-gray-900">{selectedUser.address?.city}, {selectedUser.address?.district}</span></div>
                      <div className="flex justify-between items-center py-2"><span className="text-gray-500">State & PIN</span> <span className="font-medium text-gray-900">{selectedUser.address?.state} - {selectedUser.address?.pincode}</span></div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-full">
                    <h4 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-2 pb-3 border-b border-gray-200">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Uploaded Documents ({selectedUser.kycData?.primaryDocumentType})
                    </h4>
                    <div className="space-y-6">
                      {selectedUser.kycData?.documentUrls?.map((doc, idx) => (
                        <div key={idx} className="group">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">{doc.docType}</span>
                          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden border border-gray-300 relative flex items-center justify-center">
                            <img 
                              src={`http://localhost:5000${doc.url.startsWith('/') ? '' : '/'}${doc.url}`} 
                              alt={doc.docType} 
                              className="w-full h-full object-cover"
                              onError={(e) => console.log('Image failed to load:', e.target.src)}
                            />
                            <div 
                              onClick={() => setPreviewImage(`http://localhost:5000${doc.url.startsWith('/') ? '' : '/'}${doc.url}`)}
                              className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                            >
                              <div className="bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg shadow-sm border border-gray-200 transform scale-95 group-hover:scale-100 transition-transform">
                                View Full Screen
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!selectedUser.kycData?.documentUrls || selectedUser.kycData.documentUrls.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium">
                          No documents uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Admin Notes / Reason <span className="text-gray-500 font-normal">(Required for rejection or asking for info)</span></label>
                <textarea 
                  value={actionReason} 
                  onChange={e => setActionReason(e.target.value)}
                  className="w-full bg-white text-gray-900 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6 sm:text-sm placeholder-gray-400 shadow-inner"
                  rows="2"
                  placeholder="e.g. Document image is blurry, please re-upload a clear copy."
                ></textarea>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button onClick={() => setSelectedUser(null)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200">Cancel</button>
                  <button onClick={() => handleReviewAction('SUSPENDED')} className="px-5 py-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200">Suspend</button>
                  <button onClick={() => handleReviewAction('REJECTED')} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">Reject</button>
                  <button onClick={() => handleReviewAction('MORE_INFO_REQUIRED')} className="px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500">Request Info</button>
                  <button onClick={() => handleReviewAction('ACTIVE')} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                    Approve Application
                  </button>
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

export default AdminVerificationCenter;
