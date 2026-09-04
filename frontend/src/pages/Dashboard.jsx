import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import VerificationTimeline from '../components/VerificationTimeline';

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      api.get('/bookings')
        .then(res => setBookings(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);
  
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
        {user.role !== 'admin' && (
          <>
            <RenterDashboard user={user} bookings={bookings} loading={loading} />
            <ProviderDashboard user={user} bookings={bookings} setBookings={setBookings} loading={loading} />
          </>
        )}
        {user.role === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
};

const RenterDashboard = ({ user, bookings, loading }) => {
  const [file, setFile] = useState(null);
  const [selfie, setSelfie] = useState(null);
  
  const myRentals = bookings.filter(b => b.renter === user._id || (b.renter && b.renter._id === user._id));
  
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

      {/* KYC Section */}
      <div className="col-span-1 md:col-span-1 space-y-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Identity Verification
          </h3>
          {user.kycStatus === 'Basic Verified' && (
            <form onSubmit={submitKyc} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Govt ID Document</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all" accept="image/*" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Live Selfie</label>
                <input type="file" onChange={e => setSelfie(e.target.files[0])} className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all" accept="image/*" capture="user" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all">Submit for Verification</button>
            </form>
          )}
          {user.kycStatus === 'Identity Submitted' && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <p className="text-yellow-800 font-medium text-sm">Your documents are currently under manual review by the Trust Center.</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Rentals & Reviews */}
      <div className="col-span-1 md:col-span-2 space-y-6">
        
        {/* Current Rented Products Placeholder */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Current Active Rentals
            </h3>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All History</button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading rentals...</p>
            ) : myRentals.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                 <p className="text-gray-400 font-medium text-sm">No active bookings found.</p>
              </div>
            ) : (
              myRentals.map(booking => (
                <div key={booking._id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                    {booking.product?.images?.[0] ? (
                      <img src={booking.product.images[0].startsWith('http') ? booking.product.images[0] : `http://localhost:5000${booking.product.images[0]}`} alt={booking.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Img</div>
                    )}
                  </div>
                  <div className="grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 text-lg">{booking.product?.name || 'Unknown Product'}</h4>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Cancelled' || booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs font-bold text-gray-700 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-bold text-gray-700 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ₹{booking.totalPrice} Total
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rating & Reviews Placeholder */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <h3 className="text-xl font-black text-gray-900 mb-4">My Recent Reviews</h3>
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
             </div>
             <div>
               <p className="font-bold text-gray-900">You reviewed <span className="text-blue-600">DJI Ronin Gimbal</span></p>
               <div className="flex items-center text-yellow-400 my-1">
                 {"★★★★★".split('').map((star, i) => <span key={i} className="text-sm">{star}</span>)}
               </div>
               <p className="text-sm text-gray-600">"Excellent equipment, very well maintained. The provider was extremely helpful with setup instructions!"</p>
             </div>
          </div>
        </div>

      </div>
    </>
  );
};

const ProviderDashboard = ({ user, bookings, setBookings, loading }) => {
  const providerBookings = bookings.filter(b => b.provider === user._id || (b.provider && b.provider._id === user._id));
  
  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/bookings/${id}/status`, { status });
      // Update local state directly
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: res.data.status } : b));
      alert(`Booking ${status}`);
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <>
      {/* Top Stats Overview */}
      <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Earnings</p>
            <p className="text-2xl font-black text-gray-900">₹{providerBookings.filter(b => ['Approved', 'Active', 'Completed'].includes(b.status)).reduce((acc, curr) => acc + curr.totalPrice, 0)}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Rentals</p>
            <p className="text-2xl font-black text-gray-900">{providerBookings.filter(b => b.status === 'Active').length} Items Out</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Rating</p>
            <p className="text-2xl font-black text-gray-900">4.9 / 5.0</p>
          </div>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900">My Equipment Listings</h3>
            <p className="text-gray-500 text-sm mt-1 font-medium">Manage your products and inventory.</p>
          </div>
          <button className="bg-gradient-to-r from-gray-900 to-black text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">Add New Listing</button>
        </div>

        {/* Active Rentals Out */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Rental Requests & Active
          </h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">Loading rentals...</p>
            ) : providerBookings.length === 0 ? (
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                 <p className="text-gray-400 font-medium text-sm">No bookings yet.</p>
              </div>
            ) : (
              providerBookings.map(booking => (
                <div key={booking._id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                    {booking.product?.images?.[0] ? (
                      <img src={booking.product.images[0].startsWith('http') ? booking.product.images[0] : `http://localhost:5000${booking.product.images[0]}`} alt={booking.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Img</div>
                    )}
                  </div>
                  <div className="grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 text-base">{booking.product?.name || 'Unknown Product'}</h4>
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Cancelled' || booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs font-bold text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-bold text-blue-600">Earnings: ₹{booking.totalPrice}</p>
                    </div>
                    
                    {booking.status === 'Pending' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 border-dashed">
                        <button onClick={() => updateStatus(booking._id, 'Approved')} className="px-4 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-xs rounded-lg transition-colors">Approve</button>
                        <button onClick={() => updateStatus(booking._id, 'Cancelled')} className="px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-lg transition-colors">Reject</button>
                      </div>
                    )}
                    
                    {booking.status === 'Approved' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 border-dashed">
                        <button onClick={() => updateStatus(booking._id, 'Active')} className="px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors">Mark Handed Over (Active)</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reviews Received Placeholder */}
      <div className="col-span-1 md:col-span-1">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100/50 h-full">
          <h3 className="text-xl font-black text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
               <div className="flex justify-between items-center mb-2">
                 <p className="font-bold text-gray-900 text-sm">John Doe</p>
                 <div className="flex text-yellow-400 text-xs">★★★★★</div>
               </div>
               <p className="text-xs text-gray-600 font-medium">"Great communication and the equipment was in perfect condition. Highly recommend!"</p>
            </div>
            <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
               <div className="flex justify-between items-center mb-2">
                 <p className="font-bold text-gray-900 text-sm">Sarah Smith</p>
                 <div className="flex text-yellow-400 text-xs">★★★★☆</div>
               </div>
               <p className="text-xs text-gray-600 font-medium">"Smooth rental process, though pickup was slightly delayed."</p>
            </div>
          </div>
          <button className="w-full mt-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors text-sm">View All Reviews</button>
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
