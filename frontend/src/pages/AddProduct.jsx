import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    pricePerDay: '',
    securityDeposit: '',
    condition: '',
    location: 'Chennai',
    includedAccessories: '',
    description: ''
  });

  const [images, setImages] = useState({ front: null, back: null, left: null, right: null, top: null, bottom: null, additional: [] });
  const [previews, setPreviews] = useState({ front: null, back: null, left: null, right: null, top: null, bottom: null, additional: [] });

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const p = res.data;
          setFormData({
            name: p.name || '',
            category: p.category || '',
            subCategory: p.subCategory || '',
            brand: p.brand || '',
            model: p.model || '',
            serialNumber: p.serialNumber || '',
            pricePerDay: p.pricePerDay || '',
            securityDeposit: p.securityDeposit || '',
            condition: p.condition || '',
            location: p.location || 'Chennai',
            includedAccessories: p.includedAccessories || '',
            description: p.description || ''
          });

          const resolveUrl = (url) => url ? (url.startsWith('http') ? url : `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`) : null;
          
          setPreviews({
            front: resolveUrl(p.frontImage),
            back: resolveUrl(p.backImage),
            left: resolveUrl(p.leftImage),
            right: resolveUrl(p.rightImage),
            top: resolveUrl(p.topImage),
            bottom: resolveUrl(p.bottomImage),
            additional: p.additionalImages ? p.additionalImages.map(resolveUrl) : []
          });
        } catch (err) {
          setError('Failed to load product for editing');
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const categories = ['Cameras', 'Lenses', 'Lighting', 'Audio', 'Drones', 'Grip', 'Accessories'];

  const CATEGORIES = {
    "Audio": ["Microphones", "Mixers", "Recorders", "Speakers"],
    "Cameras": ["Action Cameras", "Cinema Cameras", "DSLR", "Mirrorless", "Video Cameras"],
    "Drones": ["Accessories", "FPV", "Professional", "Prosumer"],
    "Grip & Support": ["C-Stands", "Gimbals", "Sliders", "Tripods"],
    "Lenses": ["Cinema Lenses", "Macro", "Prime Lenses", "Telephoto", "Wide Angle", "Zoom Lenses"],
    "Lighting": ["Continuous", "Flash / Strobe", "LED Panels", "Modifiers"],
    "Studio & Accessories": ["Backdrops", "Batteries", "Cables", "Memory Cards", "Monitors"]
  };

  const mainCategories = Object.keys(CATEGORIES).sort();
  const subCategories = formData.category ? CATEGORIES[formData.category].sort() : [];

  // Premium UI Classes
  const inputClasses = "w-full px-5 py-4 bg-white/60 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all duration-300 outline-none font-semibold text-gray-900 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:border-blue-400/50 placeholder:text-gray-400";
  const disabledSelectClasses = "w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none font-semibold text-gray-400 cursor-not-allowed";
  const labelClasses = "block text-sm font-extrabold text-gray-800 mb-2.5 tracking-wide uppercase text-[11px]";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData({ ...formData, category: value, subCategory: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSpecificImage = (e, view) => {
    const file = e.target.files[0];
    if (file) {
      setImages({ ...images, [view]: file });
      setPreviews({ ...previews, [view]: URL.createObjectURL(file) });
    }
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    setImages({ ...images, additional: [...images.additional, ...files].slice(0, 5) });
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews({ ...previews, additional: [...previews.additional, ...urls].slice(0, 5) });
  };

  const nextStep = () => {
    // Basic validation
    if (step === 1) {
      if (!formData.name || !formData.category || !formData.subCategory || !formData.brand || !formData.model) {
        setError('Please fill in all required basic details (including Sub-category).');
        return;
      }
    }
    if (step === 2) {
      if (!formData.pricePerDay || !formData.securityDeposit || !formData.description || !formData.condition || !formData.location) {
        setError('Please fill in all required pricing and condition details.');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If user presses Enter in step 1 or 2, just go to next step instead of submitting
    if (step < 3) {
      nextStep();
      return;
    }

    if (!previews.front || !previews.back || !previews.left || !previews.right || !previews.top || !previews.bottom) {
      setError('Please provide the 6 mandatory specific view images (Front, Back, Left, Right, Top, Bottom).');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (images.front) submitData.append('frontImage', images.front);
      if (images.back) submitData.append('backImage', images.back);
      if (images.left) submitData.append('leftImage', images.left);
      if (images.right) submitData.append('rightImage', images.right);
      if (images.top) submitData.append('topImage', images.top);
      if (images.bottom) submitData.append('bottomImage', images.bottom);
      
      images.additional.forEach(file => {
        submitData.append('additionalImages', file);
      });

      if (isEditMode) {
        const keptAdditionalImages = previews.additional.filter(url => url.startsWith('http'));
        submitData.append('keptAdditionalImages', JSON.stringify(keptAdditionalImages));
        await api.put(`/products/${id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      navigate('/my-products');
    } catch (err) {
      console.error('Frontend Submit Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'submit'} product`);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fixed Top-Right Error Toast */}
      {error && (
        <div className="fixed top-12 right-8 z-[1000] p-4 pr-10 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold flex items-center shadow-2xl animate-fade-in max-w-md">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          {error}
          <button 
            type="button" 
            onClick={() => setError(null)} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-200/60 mb-8 min-h-[800px]">

      {/* LEFT SECTION - Premium 3D Panel */}
      <div className="lg:w-5/12 xl:w-2/5 bg-[#0a0f1c] relative group border-r border-gray-800">

        {/* Sticky Inner Container */}
        <div className="lg:sticky p-5 lg:p-14 flex flex-col justify-between h-full lg:h-[calc(100vh-10rem)]">

          {/* Animated Background Gradients / Orbs */}
          <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
          <div className="absolute bottom-40 -right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 origin-left">
              Add Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Equipment</span>
            </h2>
            <p className="text-gray-400 text-lg font-medium max-w-md">Join the premium network of creators. Add your gear securely to start earning today.</p>

            {/* Vertical Step Indicator */}
            <div className="mt-10 space-y-10">
              {[
                { num: 1, title: 'Basic Details', desc: 'Title, Category, Brand' },
                { num: 2, title: 'Pricing', desc: 'Daily rate & Deposit' },
                { num: 3, title: 'Media', desc: 'High quality images' }
              ].map(s => (
                <div key={s.num} className={`flex items-start transition-all duration-700 transform ${step === s.num ? 'scale-110 translate-x-4' : (step > s.num ? 'opacity-60' : 'opacity-30')}`}>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-2xl transition-all duration-500 ${step >= s.num ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/40' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                    {step > s.num ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    ) : s.num}
                  </div>
                  <div className="ml-5">
                    <h4 className={`font-bold text-lg ${step >= s.num ? 'text-white' : 'text-gray-400'}`}>{s.title}</h4>
                    <p className={`text-sm font-medium ${step === s.num ? 'text-blue-200' : 'text-gray-600'}`}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Decorative Floating Card */}
          <div className="relative z-10 mt-10 hidden lg:block" style={{ perspective: '1000px' }}>
            <div className="w-full bg-gradient-to-tr from-white/10 to-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transform rotate-x-0 rotate-y-0 hover:rotate-y-10 hover:rotate-x-20 transition-all duration-700 ease-out">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl mb-4 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h4 className="text-white font-black text-xl mb-2">Verified Secure</h4>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">Every listing is protected. We verify renters and manage security deposits so you can rent out your gear with peace of mind.</p>
            </div>
          </div>
        </div>
      </div>
      {/* RIGHT SECTION - Form */}
      <div className="flex-1 flex flex-col py-12 px-6 sm:px-12 lg:px-20 bg-gray-50/50">

        <div className="bg-white/80 backdrop-blur-3xl py-12 px-8 sm:px-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] border border-gray-100 relative overflow-hidden w-full max-w-3xl mx-auto h-full flex flex-col">

          {/* Subtle decoration in form */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full mix-blend-multiply filter blur-[60px] opacity-70 -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col flex-1">
            <div className="flex-1 min-h-[480px]">
            {/* STEP 1: Basic Details */}
            <div className={`transition-all duration-500 ease-in-out ${step === 1 ? 'opacity-100 block transform translate-x-0' : 'opacity-0 hidden translate-x-8'}`}>
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mr-4">1</div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Basic Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Listing Title <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sony A7III with 28-70mm Lens" className={inputClasses} />
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelClasses}>Main Category <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <select name="category" value={formData.category} onChange={handleChange} className={`${inputClasses} appearance-none cursor-pointer`}>
                        <option value="" disabled>Select Main Category</option>
                        {mainCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Sub Category <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <select name="subCategory" value={formData.subCategory} onChange={handleChange} disabled={!formData.category} className={`${!formData.category ? disabledSelectClasses : inputClasses} appearance-none ${formData.category ? 'cursor-pointer' : ''}`}>
                        <option value="" disabled>{formData.category ? 'Select Sub Category' : 'Select Main Category First'}</option>
                        {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 ${formData.category ? 'text-gray-400 group-hover:text-blue-500' : 'text-gray-300'} transition-colors`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Brand <span className="text-red-500">*</span></label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Sony" className={inputClasses} />
                </div>

                <div>
                  <label className={labelClasses}>Model <span className="text-red-500">*</span></label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. A7III" className={inputClasses} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClasses}>Serial Number</label>
                  <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="Required for high-value items" className={inputClasses} />
                </div>
              </div>
            </div>

            {/* STEP 2: Pricing & Description */}
            <div className={`transition-all duration-500 ease-in-out ${step === 2 ? 'opacity-100 block transform translate-x-0' : 'opacity-0 hidden translate-x-8'}`}>
              <div className="flex items-center mb-7">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mr-4">2</div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Pricing & Description</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClasses}>Price Per Day (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="text-gray-900 font-bold">₹</span>
                    </div>
                    <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="1500" className={`${inputClasses} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Security Deposit (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="text-gray-900 font-bold">₹</span>
                    </div>
                    <input type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} placeholder="5000" className={`${inputClasses} pl-10`} />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClasses}>Description <span className="text-red-500">*</span></label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Describe the condition, included accessories, and any usage terms..." className={`${inputClasses} resize-none`}></textarea>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:col-span-2">
                  <div>
                    <label className={labelClasses}>Condition <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <select name="condition" value={formData.condition} onChange={handleChange} className={`${inputClasses} appearance-none cursor-pointer`}>
                        <option value="" disabled>Select Condition</option>
                        <option value="Like New">Like New</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Heavily Used">Heavily Used</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>City / Location <span className="text-red-500">*</span></label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Chennai" className={inputClasses} />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClasses}>Included Accessories</label>
                  <input type="text" name="includedAccessories" value={formData.includedAccessories} onChange={handleChange} placeholder="e.g. 2x Batteries, carrying case, lens hood" className={inputClasses} />
                </div>
              </div>
            </div>

            {/* STEP 3: Media */}
            <div className={`transition-all duration-500 ease-in-out ${step === 3 ? 'opacity-100 block transform translate-x-0' : 'opacity-0 hidden translate-x-8'}`}>
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mr-4">3</div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Media Upload</h3>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClasses}>Primary Angles <span className="text-red-500">*</span></label>
                  <p className="text-sm font-semibold text-gray-500 mb-4">Please upload the 6 mandatory views of the equipment.</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Specific Uploaders */}
                    {[
                      { id: 'front', label: 'Front View' },
                      { id: 'back', label: 'Back View' },
                      { id: 'left', label: 'Left View' },
                      { id: 'right', label: 'Right View' },
                      { id: 'top', label: 'Top View' },
                      { id: 'bottom', label: 'Bottom View' }
                    ].map(view => (
                      <label key={view.id} className={`flex flex-col items-center justify-center w-full h-21 border-2 ${previews[view.id] ? 'border-blue-500 border-solid' : 'border-blue-300 border-dashed'} rounded-2xl cursor-pointer bg-blue-50/30 hover:bg-blue-50/80 transition-all duration-300 group overflow-hidden relative`}>
                        {previews[view.id] ? (
                          <img src={previews[view.id]} alt={view.label} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            <span className="text-xs font-bold text-gray-600">{view.label}</span>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSpecificImage(e, view.id)} />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <label className={labelClasses}>Additional Images</label>
                      <p className="text-sm font-semibold text-gray-500">Upload up to 5 additional images</p>
                    </div>
                    {previews.additional.length > 0 && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        {previews.additional.length} / 5
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 w-full overflow-x-auto pb-2 custom-scrollbar h-28">
                    {/* Upload Button */}
                    {previews.additional.length < 5 && (
                      <label className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-full border-2 border-blue-300 border-dashed rounded-2xl cursor-pointer bg-blue-50/30 hover:bg-blue-50/80 transition-all duration-300 group">
                        <svg className="w-6 h-6 text-blue-600 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        <span className="text-[10px] font-bold text-gray-600 text-center leading-tight px-1">Add Image</span>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleAdditionalImages} />
                      </label>
                    )}
                    
                    {/* Previews */}
                    {previews.additional.map((url, idx) => (
                      <div key={idx} className="flex-shrink-0 w-28 h-full rounded-2xl overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] relative group">
                        <img src={url} alt={`Additional ${idx}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button type="button" onClick={(e) => {
                            e.preventDefault();
                            const url = previews.additional[idx];
                            if (url && url.startsWith('blob:')) {
                              const blobIndex = previews.additional.slice(0, idx).filter(u => u && u.startsWith('blob:')).length;
                              const newImages = [...images.additional];
                              newImages.splice(blobIndex, 1);
                              setImages({ ...images, additional: newImages });
                            }
                            const newPreviews = [...previews.additional];
                            newPreviews.splice(idx, 1);
                            setPreviews({ ...previews, additional: newPreviews });
                          }} className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transform hover:scale-110 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100 mt-auto">
              <button
                type="button"
                onClick={prevStep}
                className={`px-8 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all duration-300 ${step === 1 ? 'invisible' : 'visible hover:-translate-x-1'}`}
              >
                Back
              </button>

              {step < 3 ? (
                <button type="button" onClick={nextStep} className="px-10 py-3.5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:-translate-y-1 flex items-center group">
                  Continue
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-all hover:-translate-y-0.5 disabled:opacity-70 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Product' : 'Submit for Verification'
                  )}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default AddProduct;
