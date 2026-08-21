import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Multi-step state
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // General Error State
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Identity
  const [username, setUsername] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [name, setName] = useState('');

  // Step 2: Contact
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);

  // Step 3: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 4: Personal Details
  const [dob, setDob] = useState('');
  const [state, setState] = useState('Tamil Nadu'); // Defaulting for demo
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [pincode, setPincode] = useState('');
  const [consent, setConsent] = useState(false);

  // Step 5: Identity Document
  const [primaryDocumentType, setPrimaryDocumentType] = useState('Aadhaar');

  // Step 6: Uploads
  const [files, setFiles] = useState({
    docFront: null,
    docBack: null
  });

  // Final Step Data
  const [equiporaId, setEquiporaId] = useState('');

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------

  const checkUsername = async () => {
    if (username.length < 3) return;
    try {
      const { data } = await api.post('/auth/check-username', { username });
      setIsUsernameAvailable(data.available);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (username) checkUsername();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const handleSendOtp = async (type) => {
    try {
      const identifier = type === 'email' ? email : mobile;
      if (!identifier) return setErrorMsg(`Please enter a valid ${type}`);
      
      await api.post('/auth/send-otp', { identifier });
      
      if (type === 'email') setEmailOtpSent(true);
      if (type === 'mobile') setMobileOtpSent(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to send OTP to ${type}`);
    }
  };

  const handleVerifyOtp = async (type) => {
    try {
      const identifier = type === 'email' ? email : mobile;
      const otp = type === 'email' ? emailOtp : mobileOtp;
      
      await api.post('/auth/verify-otp', { identifier, otp });
      
      if (type === 'email') setEmailVerified(true);
      if (type === 'mobile') setMobileVerified(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Invalid OTP for ${type}`);
    }
  };

  const handleFileChange = (e, documentType) => {
    if (e.target.files[0]) {
      setFiles({ ...files, [documentType]: e.target.files[0] });
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 7) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleStepNext = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (step === 1 && (!isUsernameAvailable || !name)) {
      return setErrorMsg('Please fill all fields and ensure username is available.');
    }
    if (step === 2 && (!emailVerified || !mobileVerified)) {
      return setErrorMsg('Please verify both Email and Mobile to proceed.');
    }
    if (step === 3 && (password.length < 8 || password !== confirmPassword)) {
      return setErrorMsg('Passwords must match and be at least 8 characters long.');
    }
    if (step === 4 && (!dob || !district || !city || !addressLine1 || !pincode || !consent)) {
      return setErrorMsg('Please fill all mandatory personal details and consent.');
    }
    if (step === 6 && (!files.docFront)) {
      return setErrorMsg('Please upload the mandatory document front image.');
    }

    setStep(step + 1);
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
      formData.append('primaryDocumentType', primaryDocumentType);

      if (files.docFront) formData.append('docFront', files.docFront);
      if (files.docBack) formData.append('docBack', files.docBack);

      const { data } = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setEquiporaId(data.equiporaId);
      setStep(8);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Render Steps
  // ----------------------------------------------------

  const renderProgress = () => (
    <div className="mb-8 overflow-hidden">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -mt-2"></div>
        {[1, 2, 3, 4, 5, 6, 7].map(num => (
          <div key={num} className="flex flex-col items-center bg-white px-2 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
              step === num ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' :
              step > num ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > num ? '✓' : num}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-gray-50 z-0"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight cursor-pointer inline-block">Equipora</h1>
          </Link>
          <p className="mt-3 text-sm text-gray-500 font-medium tracking-wide uppercase">Universal Trust Platform</p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:rounded-3xl border border-gray-100 animate-slide-up relative">
          
          {step < 8 && renderProgress()}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-fade-in flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <form onSubmit={handleStepNext} className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create Account Identity</h2>
                <p className="text-gray-500 text-sm mt-1">Your legal name must match your identity documents.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. john_doe" />
                  {username.length > 2 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {isUsernameAvailable === true && <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      {isUsernameAvailable === false && <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and underscores.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name (As per Govt ID)</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="John Doe" />
              </div>

              <button type="submit" className="w-full py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">Continue</button>
            </form>
          )}

          {/* STEP 2: CONTACT */}
          {step === 2 && (
            <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Verify Contact Information</h2>
                <p className="text-gray-500 text-sm mt-1">We need to verify both your email and mobile number securely.</p>
              </div>

              {/* Email Verification */}
              <div className={`p-4 rounded-2xl border ${emailVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="flex space-x-2">
                  <input type="email" disabled={emailVerified} value={email} onChange={e => setEmail(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl disabled:bg-gray-100 sm:text-sm" placeholder="john@example.com" />
                  {!emailVerified && !emailOtpSent && <button type="button" onClick={() => handleSendOtp('email')} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium">Send OTP</button>}
                  {emailVerified && <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl flex items-center">Verified</span>}
                </div>
                {emailOtpSent && !emailVerified && (
                  <div className="mt-3 flex space-x-2 animate-fade-in">
                    <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} placeholder="Enter Email OTP" className="block w-full px-4 py-2 border border-gray-300 rounded-xl text-center tracking-widest font-bold" />
                    <button type="button" onClick={() => handleVerifyOtp('email')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Verify</button>
                  </div>
                )}
              </div>

              {/* Mobile Verification */}
              <div className={`p-4 rounded-2xl border ${mobileVerified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number (Primary)</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-medium">+91</span>
                    <input type="text" disabled={mobileVerified} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-xl disabled:bg-gray-100 sm:text-sm" placeholder="9876543210" />
                  </div>
                  {!mobileVerified && !mobileOtpSent && <button type="button" onClick={() => handleSendOtp('mobile')} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium">Send OTP</button>}
                  {mobileVerified && <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl flex items-center">Verified</span>}
                </div>
                {mobileOtpSent && !mobileVerified && (
                  <div className="mt-3 flex space-x-2 animate-fade-in">
                    <input type="text" value={mobileOtp} onChange={e => setMobileOtp(e.target.value)} placeholder="Enter Mobile OTP" className="block w-full px-4 py-2 border border-gray-300 rounded-xl text-center tracking-widest font-bold" />
                    <button type="button" onClick={() => handleVerifyOtp('mobile')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Verify</button>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Back</button>
                <button type="submit" disabled={!emailVerified || !mobileVerified} className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-md">Continue</button>
              </div>
            </form>
          )}

          {/* STEP 3: CREDENTIALS */}
          {step === 3 && (
            <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create Login Credentials</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Secure Password</label>
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                
                {/* Password Strength */}
                <div className="mt-2 flex space-x-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${getPasswordStrength() >= i * 25 ? (getPasswordStrength() === 100 ? 'bg-green-500' : getPasswordStrength() > 50 ? 'bg-blue-500' : 'bg-yellow-400') : 'bg-gray-200'}`}></div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Requires 8+ chars, uppercase, numbers, and symbols.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="showPwd" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="showPwd" className="ml-2 block text-sm text-gray-900">Show Password</label>
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Back</button>
                <button type="submit" className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Continue</button>
              </div>
            </form>
          )}

          {/* STEP 4: PERSONAL DETAILS */}
          {step === 4 && (
            <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Personal Verification Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender (Optional)</label>
                  <select value={state} onChange={e => setState(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white sm:text-sm">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                  <input type="text" value={state} disabled className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">District</label>
                  <select required value={district} onChange={e => setDistrict(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white sm:text-sm">
                    <option value="">Select District</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Salem">Salem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City / Town</label>
                <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm" placeholder="City" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line</label>
                  <input type="text" required value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm" placeholder="Street name, Area" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">PIN Code</label>
                  <input type="text" required value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm" placeholder="600001" />
                </div>
              </div>

              <div className="flex items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                <input type="checkbox" id="consent" required checked={consent} onChange={() => setConsent(!consent)} className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="consent" className="ml-3 block text-sm text-gray-700">
                  I confirm that I am submitting genuine information and agree to the Equipora Identity Verification Process and Privacy Policy.
                </label>
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={() => setStep(3)} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Back</button>
                <button type="submit" className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Continue</button>
              </div>
            </form>
          )}

          {/* STEP 5: DOCUMENT SELECTION */}
          {step === 5 && (
            <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Select Identity Proof</h2>
                <p className="text-gray-500 text-sm mt-1">Choose your primary government document for verification.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Aadhaar', 'Passport', 'Voter ID', 'Driving Licence'].map(doc => (
                  <div 
                    key={doc} 
                    onClick={() => setPrimaryDocumentType(doc)}
                    className={`cursor-pointer border-2 rounded-xl p-4 flex items-center transition-all ${primaryDocumentType === doc ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${primaryDocumentType === doc ? 'border-blue-600' : 'border-gray-400'}`}>
                      {primaryDocumentType === doc && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                    </div>
                    <span className="font-semibold text-gray-900">{doc}</span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setStep(4)} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Back</button>
                <button type="submit" className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Continue</button>
              </div>
            </form>
          )}

          {/* STEP 6: UPLOADS */}
          {step === 6 && (
            <form onSubmit={handleStepNext} className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Upload {primaryDocumentType}</h2>
                <p className="text-gray-500 text-sm mt-1">Clear photos, no glare. Documents are highly secured.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                  <input type="file" required onChange={(e) => handleFileChange(e, 'docFront')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                  <svg className="mx-auto h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-sm font-bold text-gray-900 block">{files.docFront ? files.docFront.name : `${primaryDocumentType} Front`}</span>
                  <span className="text-xs text-gray-500 block mt-1">{files.docFront ? 'Uploaded' : 'Click or drag file'}</span>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                  <input type="file" onChange={(e) => handleFileChange(e, 'docBack')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                  <svg className="mx-auto h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-sm font-bold text-gray-900 block">{files.docBack ? files.docBack.name : `${primaryDocumentType} Back (Optional)`}</span>
                  <span className="text-xs text-gray-500 block mt-1">{files.docBack ? 'Uploaded' : 'Click or drag file'}</span>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setStep(5)} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Back</button>
                <button type="submit" className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Review Submission</button>
              </div>
            </form>
          )}

          {/* STEP 7: REVIEW */}
          {step === 7 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Review Application</h2>
                <p className="text-gray-500 text-sm mt-1">Please ensure all details are correct before submitting for admin review.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Username</span>
                  <span className="font-bold text-gray-900">{username}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-bold text-gray-900">{name}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-bold text-green-600">{email} <br/> +91 {mobile}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Location</span>
                  <span className="font-bold text-gray-900">{city}, {state}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Identity Proof</span>
                  <span className="font-bold text-gray-900">{primaryDocumentType} (Uploaded)</span>
                </div>
              </div>

              <div className="flex items-center bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 text-xs font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                I confirm that the information and documents submitted are genuine and belong to me.
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setStep(6)} disabled={isLoading} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50">Back</button>
                <button onClick={handleFinalSubmit} disabled={isLoading} className="flex-1 flex justify-center py-3.5 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-md transition-all disabled:opacity-50">
                  {isLoading ? 'Submitting Securely...' : 'Submit for Manual Verification'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: SUCCESS / PENDING REVIEW */}
          {step === 8 && (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 border-4 border-blue-100 mb-6 relative">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Pending Verification</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Your application has been submitted securely.
              </p>

              <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden mb-8 text-left">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5"></div>
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Equipora User ID</h3>
                <p className="text-2xl font-mono font-black tracking-widest text-blue-400">{equiporaId}</p>
                <div className="mt-4 inline-block bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-bold">
                  STATUS: PENDING REVIEW
                </div>
              </div>

              <div className="text-left bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
                <h4 className="font-bold text-gray-900 text-sm mb-4">Verification Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-center text-sm"><svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Account Created</div>
                  <div className="flex items-center text-sm"><svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Email & Mobile Verified</div>
                  <div className="flex items-center text-sm"><svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Documents Submitted</div>
                  <div className="flex items-center text-sm font-bold text-blue-600"><div className="w-5 h-5 border-2 border-blue-600 rounded-full mr-3 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div></div> Manual Admin Review</div>
                  <div className="flex items-center text-sm text-gray-400"><div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div> Account Activated</div>
                </div>
              </div>

              <button onClick={() => navigate('/login')} className="w-full flex justify-center py-3.5 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-md">
                Return to Login
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 text-center text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
