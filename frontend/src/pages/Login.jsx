import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Status state for restricted users
  const [restrictedStatus, setRestrictedStatus] = useState(null);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setRestrictedStatus(null);

    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      setUser(data);
      
      if (data.role === 'admin') {
        navigate('/admin/verifications');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        // Restricted status (Pending, Rejected, Suspended, etc)
        setRestrictedStatus(error.response.data.kycStatus || 'PENDING_REVIEW');
      } else {
        setErrorMsg(error.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render Restricted View
  if (restrictedStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-gray-50 z-0"></div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center animate-slide-up">
          <div className="bg-white py-10 px-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:rounded-3xl border border-gray-100">
            {restrictedStatus === 'PENDING_REVIEW' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <svg className="h-8 w-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Under Review</h2>
                <p className="text-gray-500 mb-8 text-sm">
                  Your identity verification is currently being processed by our Trust Team. This typically takes 24-48 hours. Please check back later.
                </p>
              </>
            )}

            {restrictedStatus === 'MORE_INFO_REQUIRED' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Action Required</h2>
                <p className="text-gray-500 mb-8 text-sm">
                  Our Trust Team needs more information regarding your submitted documents. Please check your email for detailed instructions on how to proceed.
                </p>
              </>
            )}

            {restrictedStatus === 'REJECTED' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-500 mb-8 text-sm">
                  We could not verify your identity based on the documents provided. Access to the platform has been restricted.
                </p>
              </>
            )}

            {restrictedStatus === 'SUSPENDED' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
                <p className="text-gray-500 mb-8 text-sm">
                  Your account has been suspended due to a violation of our trust and safety policies. Contact support for assistance.
                </p>
              </>
            )}

            <button onClick={() => setRestrictedStatus(null)} className="w-full py-3 px-4 border border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal Login View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-gray-50 z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight cursor-pointer inline-block">Equipora</h1>
          </Link>
          <p className="mt-3 text-sm text-gray-500 font-medium tracking-wide uppercase">Universal Trust Platform</p>
        </div>

        <div className="bg-white py-10 px-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:rounded-3xl border border-gray-100 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign in to your account</h2>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-fade-in flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username, Email, or Mobile</label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500">Forgot password?</a>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="showPwdLogin" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="showPwdLogin" className="ml-2 block text-sm text-gray-900">Show Password</label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors shadow-md shadow-blue-200 disabled:opacity-70"
              >
                {isLoading ? 'Authenticating...' : 'Sign in securely'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Don't have a trust profile? </span>
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
              Create Universal Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
