import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfileData(data);
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500 font-bold">
        {error || 'Profile not found.'}
      </div>
    );
  }

  // Mask sensitive info helper
  const maskString = (str = '') => {
    if (!str || str.length < 5) return '****';
    return '****-****-' + str.slice(-4);
  };

  const statusColors = {
    'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
    'PENDING_REVIEW': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'DRAFT': 'bg-gray-100 text-gray-700 border-gray-200',
    'REJECTED': 'bg-red-100 text-red-700 border-red-200'
  };

  const statusColor = statusColors[profileData.kycStatus] || statusColors['DRAFT'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
        
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
             <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-3xl font-black text-blue-600">
               {profileData.name.charAt(0).toUpperCase()}
             </div>
          </div>
          <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusColor}`}>
            Status: {profileData.kycStatus.replace('_', ' ')}
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-16 pb-8 px-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">{profileData.name}</h1>
          <p className="text-gray-500 font-medium mb-8">@{profileData.username} &nbsp;&bull;&nbsp; Equipora ID: {profileData.equiporaId || 'N/A'}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Contact Details */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Email</p>
                  <p className="font-bold text-gray-900">{profileData.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Phone</p>
                  <p className="font-bold text-gray-900">{profileData.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Address</h3>
              <div className="space-y-4">
                {profileData.address ? (
                  <>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Street / Area</p>
                      <p className="font-bold text-gray-900">{profileData.address.line1 || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">City, State, Pincode</p>
                      <p className="font-bold text-gray-900">
                        {profileData.address.city}, {profileData.address.state} - {profileData.address.pincode}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 font-medium">No address provided.</p>
                )}
              </div>
            </div>

            {/* KYC Details */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 md:col-span-2">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">KYC Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Aadhaar Number</p>
                  <p className="font-mono font-bold text-gray-900 tracking-wider">
                    {profileData.kycData?.aadhaarNumber ? maskString(profileData.kycData.aadhaarNumber) : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">PAN Number</p>
                  <p className="font-mono font-bold text-gray-900 tracking-wider">
                    {profileData.kycData?.panNumber ? maskString(profileData.kycData.panNumber) : 'Pending'}
                  </p>
                </div>
                {profileData.kycData?.otherDocType && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">{profileData.kycData.otherDocType} Number</p>
                    <p className="font-mono font-bold text-gray-900 tracking-wider">
                      {profileData.kycData.otherDocNumber ? maskString(profileData.kycData.otherDocNumber) : 'Pending'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Metrics Panel */}
            {profileData.role === 'user' && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 md:col-span-2 mt-4 animate-fade-in-up delay-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Dashboard Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Earnings */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md border border-green-200">Active</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Total Earnings</p>
                      <p className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">₹0.00</p>
                    </div>
                  </div>

                  {/* Active Rentals */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Items on Rent</p>
                      <p className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">0</p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Past Orders</p>
                      <p className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">0</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
