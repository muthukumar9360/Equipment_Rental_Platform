import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';

const Register = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Consolidation: 4 Main Phases
  // 1: Secure Account (User, Pass, Name)
  // 2: Verification (Email/Phone OTP)
  // 3: KYC & Docs (Address, Upload)
  // 4: Success
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fields
  const [username, setUsername] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('123456');
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('123456');
  const [mobileVerified, setMobileVerified] = useState(false);

  const [dob, setDob] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [pincode, setPincode] = useState('');

  // Document Numbers
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [otherDocType, setOtherDocType] = useState('Passport');
  const [otherDocNumber, setOtherDocNumber] = useState('');

  // Uploads
  const [files, setFiles] = useState({
    docFront: null,
    panFront: null,
    otherDocFront: null
  });
  const [consent, setConsent] = useState(false);

  const [equiporaId, setEquiporaId] = useState('');

  // Check Username
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (username.length > 2) {
        try {
          const { data } = await api.post('/auth/check-username', { username });
          setIsUsernameAvailable(data.available);
        } catch (err) { console.error(err); }
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  // Handlers
  const handleSendOtp = async (type) => {
    console.log(`[OTP flow] Requesting OTP for ${type}`);
    try {
      const identifier = type === 'email' ? email : mobile;
      if (!identifier) return setErrorMsg(`Please enter a valid ${type}`);

      console.log(`[OTP flow] Simulating or calling backend to send OTP to ${identifier}`);
      try {
        await api.post('/auth/send-otp', { identifier });
      } catch (e) {
        console.warn("[OTP flow] Backend /send-otp failed, but continuing for local testing.");
      }

      type === 'email' ? setEmailOtpSent(true) : setMobileOtpSent(true);
      setErrorMsg('');
      console.log(`[OTP flow] OTP sent state updated for ${type}. Default is 123456.`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to send OTP to ${type}`);
    }
  };

  const handleVerifyOtp = async (type) => {
    const identifier = type === 'email' ? email : mobile;
    const otp = type === 'email' ? emailOtp : mobileOtp;
    console.log(`[OTP flow] Verifying ${type} OTP: ${otp} for ${identifier}`);

    try {
      if (otp === '123456') {
        console.log(`[OTP flow] Accepted default test OTP '123456' for ${type}!`);
      } else {
        await api.post('/auth/verify-otp', { identifier, otp });
        console.log(`[OTP flow] Backend successfully verified ${type} OTP.`);
      }
      type === 'email' ? setEmailVerified(true) : setMobileVerified(true);
      setErrorMsg('');
    } catch (err) {
      console.error(`[OTP flow] Verification failed for ${type}:`, err);
      setErrorMsg(err.response?.data?.message || `Invalid OTP for ${type}`);
    }
  };

  const handleFileChange = (e, documentType) => {
    if (e.target.files[0]) setFiles({ ...files, [documentType]: e.target.files[0] });
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleStepNext = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1) {
      if (!isUsernameAvailable || !name || password.length < 8) {
        return setErrorMsg('Please ensure all fields are valid and password is at least 8 characters.');
      }
    }
    if (step === 2) {
      if (!emailVerified || !mobileVerified) return setErrorMsg('Both Email and Mobile must be verified.');
    }
    if (step === 3) {
      if (!dob || !district || !city || !addressLine1 || !pincode) {
        return setErrorMsg('Please complete all personal details.');
      }
    }
    if (step === 4) {
      if (!aadhaarNumber || !panNumber) {
        return setErrorMsg('Aadhaar and PAN numbers are required.');
      }
    }
    if (step === 5) {
      if (!files.docFront || !files.panFront || !consent) {
        return setErrorMsg('Please complete document uploads and consent.');
      }
    }

    if (step === 5) {
      handleFinalSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', mobile);
      formData.append('password', password);
      formData.append('dob', dob);
      formData.append('state', state);
      formData.append('district', district);
      formData.append('city', city);
      formData.append('line1', addressLine1);
      formData.append('pincode', pincode);
      formData.append('aadhaarNumber', aadhaarNumber);
      formData.append('panNumber', panNumber);
      formData.append('otherDocType', otherDocType);
      if (otherDocNumber) formData.append('otherDocNumber', otherDocNumber);

      if (files.docFront) formData.append('docFront', files.docFront);
      if (files.panFront) formData.append('panFront', files.panFront);
      if (files.otherDocFront) formData.append('otherDocFront', files.otherDocFront);

      const { data } = await api.post('/auth/register', formData);
      setEquiporaId(data.equiporaId);
      setStep(6);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = ["Account", "Verify", "Personal", "Docs", "Upload"];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">


      <div className="w-full max-w-[1600px] h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] bg-white rounded-3xl lg:rounded-[3rem] shadow-2xl flex overflow-hidden border border-gray-100 relative">

        {/* Left Column - Image & Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[55%] relative bg-gray-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
            alt="Premium Equipment"
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
                Verified Marketplace
              </span>
              <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
                Rent smart.<br />Get more done.
              </h2>
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 inline-flex">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-gray-900" src="https://i.pravatar.cc/100?img=12" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-gray-900" src="https://i.pravatar.cc/100?img=32" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-gray-900" src="https://i.pravatar.cc/100?img=52" alt="User" />
                </div>
                <p className="text-gray-200 font-medium text-sm">Join <span className="font-bold text-white">10,000+</span> verified users.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center py-6 relative overflow-y-auto">

          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center space-x-2 text-gray-900">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md">E</div>
              <span className="text-2xl font-black tracking-tight">Equipora</span>
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto relative z-10 animate-fade-in-up">

            <div className="mb-1 text-center lg:text-left">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Create Account</h1>
              <p className="text-gray-500 font-medium">Join the Equipora network securely.</p>
            </div>

            {/* Progress Indicator */}
            {step < 6 && (
              <div className="mb-10 mt-5">
                <div className="flex justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full -z-10"></div>
                  <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full -z-10 transition-all duration-700" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                  {[1, 2, 3, 4, 5].map(num => (
                    <div key={num} className="flex flex-col items-center relative">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-500 ${step === num ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50' :
                        step > num ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border-2 border-gray-200'
                        }`}>
                        {step > num ? <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : num}
                      </div>
                      <span className={`absolute -bottom-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>
                        {stepTitles[num - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="fixed top-8 right-8 max-w-sm z-50 p-4 bg-white border-l-4 border-red-500 rounded-2xl text-gray-800 text-sm font-bold flex items-start shadow-2xl animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-red-600 text-[10px] font-black uppercase tracking-wider mb-0.5">Registration Error</h4>
                  <p className="leading-relaxed font-medium">{errorMsg}</p>
                </div>
                <button type="button" onClick={() => setErrorMsg('')} className="ml-3 text-gray-400 hover:text-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <form onSubmit={handleStepNext} className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Legal Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                    placeholder="As per Govt ID ( Adhaar or Pan )"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                      placeholder="e.g. john_doe"
                    />
                    {username.length > 2 && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        {isUsernameAvailable === true && <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded-xl"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Available</span>}
                        {isUsernameAvailable === false && <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">Taken</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium transition-colors pr-12"
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

                  <div className="mt-3 flex space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${getPasswordStrength() >= i * 25 ? (getPasswordStrength() === 100 ? 'bg-green-500' : getPasswordStrength() > 50 ? 'bg-blue-500' : 'bg-yellow-400') : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-4 px-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] transform hover:-translate-y-0.5 mt-2">
                  Continue to Verification
                </button>
              </form>
            )}

            {/* STEP 2: VERIFICATION */}
            {step === 2 && (
              <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">

                {/* Email */}
                <div className={`p-5 rounded-2xl border transition-all ${emailVerified ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <input type="email" required disabled={emailVerified} value={email} onChange={e => setEmail(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-medium disabled:opacity-60 text-sm" placeholder="you@example.com" />
                    {!emailVerified && !emailOtpSent && <button type="button" onClick={() => handleSendOtp('email')} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold whitespace-nowrap shadow-sm">Send OTP</button>}
                    {emailVerified && <span className="px-5 py-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-sm"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Verified</span>}
                  </div>
                  {emailOtpSent && !emailVerified && (
                    <div className="mt-4 flex space-x-3 animate-fade-in">
                      <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-center tracking-widest font-black text-lg focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => handleVerifyOtp('email')} className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm">Verify</button>
                    </div>
                  )}
                </div>

                {/* Mobile */}
                {emailVerified && (
                  <div className={`p-5 rounded-2xl border transition-all animate-fade-in ${mobileVerified ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 font-bold">+91</span>
                        <input type="text" required disabled={mobileVerified} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} className="block w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white font-medium disabled:opacity-60 text-sm" placeholder="9876543210" />
                      </div>
                      {!mobileVerified && !mobileOtpSent && <button type="button" onClick={() => handleSendOtp('mobile')} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold whitespace-nowrap shadow-sm">Send OTP</button>}
                      {mobileVerified && <span className="px-5 py-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-sm"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Verified</span>}
                    </div>
                    {mobileOtpSent && !mobileVerified && (
                      <div className="mt-4 flex space-x-3 animate-fade-in">
                        <input type="text" value={mobileOtp} onChange={e => setMobileOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-center tracking-widest font-black text-lg focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={() => handleVerifyOtp('mobile')} className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm">Verify</button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-4 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">Back</button>
                  <button type="submit" disabled={!emailVerified || !mobileVerified} className="flex-1 py-4 px-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md">Continue to Details</button>
                </div>
              </form>
            )}

            {/* STEP 3: Personal Details */}
            {step === 3 && (
              <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">1</span>
                    Personal Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                      <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                      <div className="relative">
                        <select required value={district} onChange={e => setDistrict(e.target.value)} className="appearance-none block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium pr-10 cursor-pointer transition-colors">
                          <option value="" disabled>Select District</option>
                          <option value="Chennai">Chennai</option>
                          <option value="Coimbatore">Coimbatore</option>
                          <option value="Madurai">Madurai</option>
                          <option value="Salem">Salem</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City/Town</label>
                      <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code</label>
                      <input type="text" required value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                    <input type="text" required value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">Back</button>
                  <button type="submit" className="flex-1 flex justify-center py-4 px-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black shadow-md transform hover:-translate-y-0.5 transition-all">
                    Continue to Documents
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Document Details */}
            {step === 4 && (
              <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">2</span>
                    Document Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Aadhaar Number (Required)</label>
                      <input type="text" required value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" placeholder="0000 0000 0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">PAN Number (Required)</label>
                      <input type="text" required value={panNumber} onChange={e => setPanNumber(e.target.value.toUpperCase().slice(0, 10))} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" placeholder="ABCDE1234F" />
                    </div>
                    <div className="flex space-x-3">
                      <div className="w-1.5/3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Other Documents</label>
                        <div className="relative">
                          <select value={otherDocType} onChange={e => setOtherDocType(e.target.value)} className="appearance-none block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium pr-10 cursor-pointer focus:ring-2 focus:ring-blue-500 transition-colors">
                            <option value="Passport">Passport</option>
                            <option value="License">Driving License</option>
                            <option value="Voter ID">Voter ID</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="w-2/3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">{otherDocType} Number</label>
                        <input type="text" value={otherDocNumber} onChange={e => setOtherDocNumber(e.target.value)} className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium" placeholder={`Document Number`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setStep(3)} className="px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">Back</button>
                  <button type="submit" className="flex-1 flex justify-center py-4 px-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black shadow-md transform hover:-translate-y-0.5 transition-all">
                    Continue to Uploads
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5: Document Uploads */}
            {step === 5 && (
              <form onSubmit={handleStepNext} className="space-y-2 animate-slide-up">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">3</span>
                    Document Uploads
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:bg-gray-100 transition-colors relative group bg-white">
                      <input type="file" required onChange={(e) => handleFileChange(e, 'docFront')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*,.pdf" />
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${files.docFront ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                        {files.docFront ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                      </div>
                      <span className="text-sm font-bold text-gray-900 block">{files.docFront ? files.docFront.name : 'Aadhaar Front'}</span>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:bg-gray-100 transition-colors relative group bg-white">
                      <input type="file" required onChange={(e) => handleFileChange(e, 'panFront')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*,.pdf" />
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${files.panFront ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                        {files.panFront ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                      </div>
                      <span className="text-sm font-bold text-gray-900 block">{files.panFront ? files.panFront.name : 'PAN Card Front'}</span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:bg-gray-100 transition-colors relative group bg-white mt-2">
                    <input type="file" required onChange={(e) => handleFileChange(e, 'otherDocFront')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*,.pdf" />
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${files.otherDocFront ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                      {files.otherDocFront ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                    </div>
                    <span className="text-sm font-bold text-gray-900 block">{files.otherDocFront ? files.otherDocFront.name : `Upload ${otherDocType}`}</span>
                  </div>
                </div>

                <div className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input type="checkbox" id="consent" required checked={consent} onChange={() => setConsent(!consent)} className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="consent" className="ml-3 block text-xs font-medium text-gray-600 leading-relaxed">
                    I agree to the <span className="text-blue-600 font-bold">Terms of Service</span> and confirm all provided information is accurate and belongs to me.
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setStep(4)} disabled={isLoading} className="px-6 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-colors">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-1 flex justify-center py-4 px-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5 transition-all disabled:opacity-50">
                    {isLoading ? <Loader type="inline" text="Submitting..." /> : 'Submit Securely'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 6: SUCCESS */}
            {step === 6 && (
              <div className="text-center py-6 animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 border-4 border-green-100 mb-6 relative">
                  <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Under Review</h2>
                <p className="text-gray-500 mb-8 font-medium">
                  Your application has been submitted securely.
                </p>

                <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden mb-8 text-left">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Equipora User ID</h3>
                  <p className="text-2xl font-mono font-black tracking-wider text-white">{equiporaId}</p>
                  <div className="mt-4 inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Status: Pending
                  </div>
                </div>

                <button onClick={() => navigate('/login')} className="w-full flex justify-center py-4 px-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-colors border border-gray-200">
                  Proceed to Login
                </button>
              </div>
            )}

            {/* Bottom Links */}
            {step < 6 && (
              <div className="pt-3 text-center text-sm font-medium flex flex-col items-center space-y-4">
                <div className='flex items-center justify-center space-x-4'>
                  <Link to="/" className="inline-flex items-center justify-center text-black transition-colors font-bold underline mr-5 hover:text-blue-600">
                    Home
                  </Link>
                  <span className="text-gray-500">Already have an account? </span>
                  <Link to="/login" className="font-bold underline text-gray-900 hover:text-blue-600 transition-colors">
                    Log in
                  </Link>

                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;