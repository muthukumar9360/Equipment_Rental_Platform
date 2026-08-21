import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import VerificationTimeline from '../components/VerificationTimeline';

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h2>
          <p className="text-gray-500 mt-1">Role: <span className="capitalize">{user.role}</span> | Trust Score: <span className="font-bold text-primary">{user.trustScore || 0}/100</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Verification Status</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${user.kycStatus === 'Fully Verified' ? 'bg-green-100 text-green-800' :
              user.kycStatus === 'Identity Submitted' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}>
            {user.kycStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user.role === 'renter' && <RenterDashboard user={user} />}
        {user.role === 'provider' && <ProviderDashboard user={user} />}
        {user.role === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
};

const RenterDashboard = ({ user }) => {
  const [file, setFile] = useState(null);
  const [selfie, setSelfie] = useState(null);
  
  const submitKyc = async (e) => {
    e.preventDefault();
    if (!file || !selfie) return alert("Please select both ID and Selfie");
    
    const formData = new FormData();
    formData.append('idDocument', file);
    formData.append('selfie', selfie);
    
    try {
      const { data } = await api.post('/users/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('KYC Submitted!');
      window.location.reload();
    } catch (error) {
      alert('Failed to submit KYC');
    }
  };

  return (
    <>
      <div className="col-span-1 md:col-span-3">
        <VerificationTimeline kycStatus={user.kycStatus} />
      </div>
      <div className="col-span-1 md:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4">Identity Verification</h3>
          {user.kycStatus === 'Basic Verified' && (
            <form onSubmit={submitKyc} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Govt ID Document</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="mt-1 block w-full text-sm" accept="image/*" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Live Selfie</label>
                <input type="file" onChange={e => setSelfie(e.target.files[0])} className="mt-1 block w-full text-sm" accept="image/*" capture="user" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Submit for Verification</button>
            </form>
          )}
          {user.kycStatus === 'Identity Submitted' && (
            <p className="text-gray-500">Your documents are under manual review by the Trust Center.</p>
          )}
        </div>
      </div>
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
          <h3 className="text-xl font-semibold mb-4">My Bookings</h3>
          <p className="text-gray-500">No active bookings found.</p>
        </div>
      </div>
    </>
  );
};

const ProviderDashboard = ({ user }) => {
  return (
    <>
      <div className="col-span-1 md:col-span-3">
        <VerificationTimeline kycStatus={user.kycStatus} />
      </div>
      <div className="col-span-1 md:col-span-3">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold">My Equipment Listings</h3>
          <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Add New Listing</button>
        </div>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const [pendingKyc, setPendingKyc] = useState([]);

  useEffect(() => {
    api.get('/users/admin/kyc-pending').then(res => setPendingKyc(res.data));
  }, []);

  const approve = async (id) => {
    try {
      await api.put(`/users/admin/kyc/${id}`, { status: 'Fully Verified' });
      setPendingKyc(pendingKyc.filter(u => u._id !== id));
    } catch (e) {
      alert("Error approving");
    }
  }

  return (
    <div className="col-span-1 md:col-span-3">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xl font-semibold mb-4">Equipora Trust Center</h3>
        <h4 className="text-lg font-medium text-gray-700 mb-2">Pending Identity Verifications</h4>
        {pendingKyc.length === 0 ? <p className="text-gray-500">No pending verifications.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingKyc.map(u => (
                  <tr key={u._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{u.name} ({u.email})</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{u.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button onClick={() => approve(u._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Approve</button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
