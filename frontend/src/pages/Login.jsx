import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  // Form Data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  // OTP Data
  const [emailOtp, setEmailOtp] = useState('123456');
  const [mobileOtp, setMobileOtp] = useState('123456');

  // Flow State
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restrictedStatus, setRestrictedStatus] = useState(null);

  // User Details from Pre-Login
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePreLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setRestrictedStatus(null);

    try {
      // 1. Validate credentials and role
      const { data } = await api.post('/auth/pre-login', { username, password, role });

      setUserEmail(data.email);
      setUserPhone(data.phone);

      // 2. Trigger OTP sending for both email and phone
      await api.post('/auth/send-otp', { identifier: data.email, type: 'login' });
      await api.post('/auth/send-otp', { identifier: data.phone, type: 'login' });

      // Move to OTP Step
      setStep(2);
    } catch (error) {
      if (error.response?.status === 403) {
        if (error.response.data.kycStatus) {
          setRestrictedStatus(error.response.data.kycStatus);
        } else {
          setErrorMsg(error.response?.data?.message || 'Access denied');
        }
      } else {
        setErrorMsg(error.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Verify Email OTP
      await api.post('/auth/verify-otp', { identifier: userEmail, otp: emailOtp });

      // 2. Verify Mobile OTP
      await api.post('/auth/verify-otp', { identifier: userPhone, otp: mobileOtp });

      // 3. Final Login to get Token
      const { data } = await api.post('/auth/login', { username, password });
      setUser(data);

      if (data.role === 'admin') {
        navigate('/admin/verifications');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Invalid OTP');
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">

      <div className="w-full max-w-[1600px] h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] bg-white rounded-3xl lg:rounded-[3rem] shadow-2xl flex overflow-hidden border border-gray-100 relative">

        {/* Left Column - Image & Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[60%] relative bg-gray-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80"
            alt="Secure Login"
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 h-full w-full">
            <div>
              <Link to="/" className="inline-flex items-center space-x-3 text-white group">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">E</div>
                <span className="text-3xl font-black tracking-tight">Equipora</span>
              </Link>
            </div>

            <div className="mt-auto">
              <span className="inline-block py-1.5 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest border border-blue-400/30 mb-6">
                Secure Authentication
              </span>
              <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
                Welcome back.<br />Let's get to work.
              </h2>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center py-3 relative overflow-y-auto">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center space-x-2 text-gray-900">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md">E</div>
              <span className="text-2xl font-black tracking-tight">Equipora</span>
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto sm:px-10">

            {/* Error Popup - Top Right */}
            {errorMsg && (
              <div className="fixed top-8 right-8 max-w-sm z-50 p-4 bg-white border-l-4 border-red-500 rounded-2xl text-gray-800 text-sm font-bold flex items-start shadow-2xl animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-700 font-black mb-1">Authentication Error</p>
                  <p className="text-gray-600 font-medium leading-relaxed">{errorMsg}</p>
                </div>
                <button onClick={() => setErrorMsg('')} className="ml-3 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="mb-8 mt-5 relative">
              {/* Connecting Lines */}
              <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-gray-200 z-0"></div>
              <div className="absolute top-4 left-[10%] h-[2px] bg-blue-600 z-0 transition-all duration-700" style={{ width: `${((step - 1) / 1) * 80}%` }}></div>
              
              <div className="flex justify-between relative z-10 px-[10%]">
                {[1, 2].map((s) => (
                  <div key={s} className="flex flex-col items-center bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all duration-500 ${step >= s ? 'bg-blue-600 text-white scale-110' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                      {step > s ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : s}
                    </div>
                    <span className={`absolute top-10 text-[10px] uppercase tracking-widest font-bold mt-1 transition-colors duration-300 ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                      {s === 1 ? 'Credentials' : 'Security'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: Credentials */}
            {step === 1 && (
              <form onSubmit={handlePreLogin} className="space-y-6 animate-fade-in">

                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Sign in to Equipora</h2>
                  <p className="text-gray-500 font-medium mb-4">Welcome back! Please enter your details.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button type="button" onClick={() => setRole('user')} className={`py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${role === 'user' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                    Customer
                  </button>
                  <button type="button" onClick={() => setRole('admin')} className={`py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${role === 'admin' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}>
                    Admin
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="block w-full px-4 py-3.5 bg-gray-50 border-0 text-gray-900 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700">Password</label>
                    <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-gray-50 border-0 text-gray-900 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-4 px-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 mt-6">
                  {isLoading ? 'Verifying...' : 'Continue Securely'}
                </button>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleFinalLogin} className="space-y-6 animate-slide-up pb-8">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">2</span>
                    Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mb-6 ml-8">We've sent security codes to your email and phone.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email OTP (Sent to {userEmail})</label>
                      <input type="text" required value={emailOtp} onChange={e => setEmailOtp(e.target.value)} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-center tracking-[0.5em] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="------" maxLength="6" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mobile OTP (Sent to {userPhone})</label>
                      <input type="text" required value={mobileOtp} onChange={e => setMobileOtp(e.target.value)} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-center tracking-[0.5em] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="------" maxLength="6" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-colors">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-1 flex justify-center py-4 px-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-70">
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Links */}
            {step === 1 && (
              <div className="pt-2 mt-2 text-center text-sm font-medium flex flex-col items-center space-y-4 border-t border-gray-100">
                <div>
                  <span className="text-gray-500">Don't have a trust profile? </span>
                  <Link to="/register" className="font-bold underline text-gray-900 hover:text-blue-600 transition-colors">
                    Create Account
                  </Link>
                </div>
                <Link to="/" className="inline-flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 mt-2 rounded-xl font-bold">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to Home
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
