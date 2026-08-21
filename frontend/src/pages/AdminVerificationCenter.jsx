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
    <div className="py-8 animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Admin Verification Center</h2>
          <p className="text-gray-500 mt-1">Review and approve new user identities.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold border border-blue-200 shadow-sm">
          {pendingUsers.length} Pending Reviews
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipora ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Document Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingUsers.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-blue-600">{u.equiporaId}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">@{u.username}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">
                    {u.emailVerified && 'Email ✓'} {u.mobileVerified && 'Mobile ✓'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {u.kycData?.primaryDocumentType || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                    u.kycStatus === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 
                    u.kycStatus === 'MORE_INFO_REQUIRED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.kycStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openReviewModal(u)} className="text-blue-600 hover:text-blue-900 font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    Review Application
                  </button>
                </td>
              </tr>
            ))}
            {pendingUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                  Queue is empty. Great job!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Review Identity</h3>
                <p className="text-blue-600 font-mono font-bold mt-1">{selectedUser.equiporaId}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Personal Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Name</span> <span className="font-bold text-gray-900">{selectedUser.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Username</span> <span className="font-bold text-gray-900">@{selectedUser.username}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">DOB</span> <span className="font-bold text-gray-900">{new Date(selectedUser.dob).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Gender</span> <span className="font-bold text-gray-900">{selectedUser.gender}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Location</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Address</span> <span className="font-bold text-gray-900 text-right">{selectedUser.address?.line1}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">City</span> <span className="font-bold text-gray-900">{selectedUser.address?.city}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">District</span> <span className="font-bold text-gray-900">{selectedUser.address?.district}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">State</span> <span className="font-bold text-gray-900">{selectedUser.address?.state}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">PIN</span> <span className="font-bold text-gray-900">{selectedUser.address?.pincode}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 p-5 rounded-2xl text-white shadow-inner">
                <h4 className="text-sm font-bold text-gray-300 mb-4 border-b border-gray-700 pb-2">Uploaded Documents ({selectedUser.kycData?.primaryDocumentType})</h4>
                <div className="space-y-4">
                  {selectedUser.kycData?.documentUrls?.map((doc, idx) => (
                    <div key={idx}>
                      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{doc.docType}</span>
                      <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative group flex items-center justify-center">
                        {/* Mock image preview if actual file doesn't exist locally */}
                        <div className="text-gray-600 text-sm">Image Preview</div>
                        <a href={`http://localhost:5000/${doc.url}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold cursor-pointer">
                          View Full Screen
                        </a>
                      </div>
                    </div>
                  ))}
                  {(!selectedUser.kycData?.documentUrls || selectedUser.kycData.documentUrls.length === 0) && (
                    <div className="text-gray-500 text-sm text-center py-8">No documents uploaded</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes / Reason (Required for rejection or asking for info)</label>
              <textarea 
                value={actionReason} 
                onChange={e => setActionReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 mb-6 sm:text-sm"
                rows="2"
                placeholder="e.g. Document image is blurry, please re-upload."
              ></textarea>

              <div className="flex flex-wrap gap-4 justify-end">
                <button onClick={() => setSelectedUser(null)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                <button onClick={() => handleReviewAction('SUSPENDED')} className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200">Suspend</button>
                <button onClick={() => handleReviewAction('REJECTED')} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Reject</button>
                <button onClick={() => handleReviewAction('MORE_INFO_REQUIRED')} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600">Request Info</button>
                <button onClick={() => handleReviewAction('ACTIVE')} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md">Approve & Activate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationCenter;
