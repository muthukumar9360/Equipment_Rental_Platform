import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import Loader from '../components/Loader';

const Profile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter State
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Verified', 'Pending', 'Rejected'];

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [publicCategory, setPublicCategory] = useState('');
  const [publicSubCategory, setPublicSubCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);

  // Edit State
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Social Features State
  const [activeModal, setActiveModal] = useState(null); // 'followers', 'following', 'requests'
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [savedProducts, setSavedProducts] = useState(new Set());

  const isOwnProfile = !id || (user && id === user._id);
  const targetId = isOwnProfile ? user?._id : id;

  useEffect(() => {
    if (!targetId) return;
    fetchProfileAndProducts();
  }, [targetId]);

  const fetchProfileAndProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/users/profile/${targetId}`);
      setProfileData(data);
      if (isOwnProfile) {
        setEditName(data.name || '');
        setEditBio(data.bio || '');
        const productsRes = await api.get('/products/my-products');
        setUserProducts(productsRes.data);
      } else {
        const productsRes = await api.get(`/products?providerId=${targetId}`);
        setUserProducts(productsRes.data);
      }

    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLikedProducts(new Set(user.likedProducts || []));
      setSavedProducts(new Set(user.savedProducts || []));
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/profile/${targetId}`);
      setProfileData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      // Optimistic update for instant feedback
      setProfileData(prev => ({
        ...prev,
        followers: [...(prev.followers || []), user]
      }));

      await api.post(`/users/follow/${targetId}`);
      fetchProfile(); // Refresh to sync
    } catch (err) {
      alert(err.response?.data?.message || 'Error following user');
      fetchProfile(); // Revert on error
    }
  };

  const handleUnfollow = async () => {
    try {
      // Optimistic update for instant feedback
      setProfileData(prev => ({
        ...prev,
        followers: prev.followers?.filter(f => f._id !== user?._id && f !== user?._id)
      }));

      await api.post(`/users/unfollow/${targetId}`);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Error unfollowing user');
      fetchProfile(); // Revert on error
    }
  };

  const handleDismissNotification = async (requesterId) => {
    try {
      await api.post(`/users/reject-follow/${requesterId}`);
      fetchProfile();
    } catch (err) {
      alert('Error dismissing notification');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('bio', editBio);
      if (editImage) {
        formData.append('profileImage', editImage);
      }

      await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async (productId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!user) return alert('Please login to like products');
    try {
      const { data } = await api.post(`/users/like/${productId}`);
      setLikedProducts(prev => {
        const newSet = new Set(prev);
        if (data.isLiked) newSet.add(productId);
        else newSet.delete(productId);
        return newSet;
      });
    } catch (err) {
      console.error('Error liking product', err);
    }
  };

  const handleSave = async (productId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!user) return alert('Please login to save products');
    try {
      const { data } = await api.post(`/users/save/${productId}`);
      setSavedProducts(prev => {
        const newSet = new Set(prev);
        if (data.isSaved) newSet.add(productId);
        else newSet.delete(productId);
        return newSet;
      });
    } catch (err) {
      console.error('Error saving product', err);
    }
  };

  if (loading) {
    return <Loader type="fullpage" text="Loading Profile..." />;
  }

  if (error || !profileData) {
    return <div className="text-center mt-20 text-red-500 font-bold">{error || 'Profile not found'}</div>;
  }

  const isFollowing = profileData.followers?.some(f => f._id === user?._id || f === user?._id);
  const isRequested = profileData.followRequests?.some(r => r._id === user?._id || r === user?._id);
  
  const isAdminProfile = profileData?.role === 'admin' || (isOwnProfile && user?.role === 'admin');

  let filteredProducts = userProducts;
  
  if (isOwnProfile && activeTab !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.verificationStatus === activeTab);
  }
  
  // Apply category, subcategory and search filters for ALL profiles
  if (productSearchTerm) {
    const lowerSearch = productSearchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name?.toLowerCase().includes(lowerSearch));
  }
  if (publicCategory) {
    filteredProducts = filteredProducts.filter(p => p.category === publicCategory);
  }
  if (publicSubCategory) {
    filteredProducts = filteredProducts.filter(p => p.subCategory === publicSubCategory);
  }

  const uniqueCategories = [...new Set(userProducts.map(p => p.category))].filter(Boolean);
  const uniqueSubCategories = publicCategory 
    ? [...new Set(userProducts.filter(p => p.category === publicCategory).map(p => p.subCategory))].filter(Boolean)
    : [...new Set(userProducts.map(p => p.subCategory))].filter(Boolean);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-12 pb-8 mb-5 animate-fade-in">
      <div className="max-w-8xl mx-auto px-4 sm:px-6">
        
        {/* Premium Profile Header */}
        <div className="relative mb-16">
          {/* Cover Background */}
          <div className="h-48 md:h-64 w-full rounded-[2rem] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden shadow-2xl">
            {/* Abstract decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            
            {/* Header Actions Overlay (Share etc) */}
            <div className="absolute top-6 right-6 flex gap-3 z-10">

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied to clipboard!');
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-sm border border-white/10"
                title="Share Profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
            </div>
          </div>

          {/* Profile Details Card - Overlapping */}
          <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-20 -mt-24 md:-mt-44">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:px-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              {/* Avatar */}
              <div className="flex-shrink-0 relative -mt-16 md:-mt-20">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-[2rem] bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-1.5 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[1.8rem] overflow-hidden relative">
                    {profileData.profileImage ? (
                      <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-5xl font-black">
                        {profileData.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Verified Badge */}
                <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-xl shadow-lg">
                  <div className="bg-green-500 text-white p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
              </div>

              {/* Info & Stats */}
              <div className="flex-grow w-full text-center md:text-left flex flex-col justify-between h-full pl-5">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-0">
                  
                  {/* Name & Title */}
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-5">
                      {profileData.username || profileData.name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100">
                        {isAdminProfile ? 'Admin' : 'Verified Member'}
                      </span>
                      <span className="flex items-center text-sm font-bold text-gray-500">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {profileData.address?.city || 'Location Unknown'}
                      </span>
                    </div>
                    
                    {/* Bio */}
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto md:mx-0">
                      {profileData.bio || "This user hasn't written a bio yet."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
                    {isOwnProfile ? (
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 text-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Edit Profile
                      </button>
                    ) : !isAdminProfile ? (
                      <>
                        <button 
                          onClick={() => navigate('/messages', { state: { receiverId: profileData._id } })}
                          className="px-6 py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all shadow-sm text-sm"
                        >
                          Message
                        </button>
                        {isFollowing ? (
                          <button 
                            onClick={handleUnfollow}
                            className="px-6 py-3 bg-white border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-gray-900 font-bold rounded-xl transition-all shadow-sm text-sm"
                          >
                            Following
                          </button>
                        ) : isRequested ? (
                          <button 
                            disabled
                            className="px-8 py-3 bg-gray-400 text-white font-bold rounded-xl shadow-sm text-sm cursor-not-allowed"
                          >
                            Requested
                          </button>
                        ) : (
                          <button 
                            onClick={handleFollow}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)] transform hover:-translate-y-0.5 text-sm"
                          >
                            Follow
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-16 mt-3">
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{userProducts.length}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Products</p>
                  </div>
                  <div 
                    className="text-center cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => setActiveModal('followers')}
                  >
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{profileData.followers?.length || 0}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Followers</p>
                  </div>
                  <div 
                    className="text-center cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => setActiveModal('following')}
                  >
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{profileData.following?.length || 0}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Following</p>
                  </div>
                  <div className="text-center border-l border-gray-100 pl-8 hidden sm:block">
                    <p className="text-3xl font-black text-[#00b050] tracking-tight">{profileData.trustScore || 100}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Trust Score</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* User's Products Grid (Hidden for Admins) */}
        {!isAdminProfile && (
          <div className="mt-0 px-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    
            {isOwnProfile && (
              <div className="flex space-x-2 mr-2 pb-2 scrollbar-hide w-full md:w-auto">
                {tabs.map(tab => {
                  const count = tab === 'All' ? userProducts.length : userProducts.filter(p => p.verificationStatus === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center space-x-2 ${
                        activeTab === tab 
                          ? 'bg-gray-900 text-white shadow-md' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{tab}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
            
            {userProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto mt-4 md:mt-0">
                {/* Search Bar */}
                <div className="relative w-full sm:w-[220px]">
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => { setProductSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none transition-all"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                
                {/* Category Dropdown */}
                <div 
                  className="relative" 
                  tabIndex={0} 
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsCategoryDropdownOpen(false);
                    }
                  }}
                >
                  <button 
                    onClick={() => {
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                      setIsSubCategoryDropdownOpen(false);
                    }}
                    className="flex items-center justify-between min-w-[160px] px-4 py-2.5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl text-sm font-bold text-gray-700 shadow-sm transition-colors"
                  >
                    <span className="truncate">{publicCategory || 'All Categories'}</span>
                    <svg className={`w-4 h-4 ml-2 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 py-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto overflow-x-hidden animate-fade-in-up custom-scrollbar">
                      <button 
                        onClick={() => { setPublicCategory(''); setPublicSubCategory(''); setCurrentPage(1); setIsCategoryDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 transition-colors ${!publicCategory ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                      >
                        All Categories
                      </button>
                      {uniqueCategories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => { setPublicCategory(cat); setPublicSubCategory(''); setCurrentPage(1); setIsCategoryDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 transition-colors ${publicCategory === cat ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subcategory Dropdown */}
                <div 
                  className="relative" 
                  tabIndex={0} 
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsSubCategoryDropdownOpen(false);
                    }
                  }}
                >
                  <button 
                    onClick={() => {
                      setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="flex items-center justify-between min-w-[160px] px-4 py-2.5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl text-sm font-bold text-gray-700 shadow-sm transition-colors"
                  >
                    <span className="truncate">{publicSubCategory || 'All Subcategories'}</span>
                    <svg className={`w-4 h-4 ml-2 transition-transform duration-300 ${isSubCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  {isSubCategoryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 py-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto overflow-x-hidden animate-fade-in-up custom-scrollbar">
                      <button 
                        onClick={() => { setPublicSubCategory(''); setCurrentPage(1); setIsSubCategoryDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 transition-colors ${!publicSubCategory ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                      >
                        All Subcategories
                      </button>
                      {uniqueSubCategories.map(sub => (
                        <button 
                          key={sub}
                          onClick={() => { setPublicSubCategory(sub); setCurrentPage(1); setIsSubCategoryDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 transition-colors ${publicSubCategory === sub ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
          
          {userProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              <p className="text-gray-500 font-medium">No products listed by this user yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {currentProducts.map((product) => (
                  <div 
                    key={product._id}
                    onClick={() => setSelectedPreviewProduct(product)}
                    className="group relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-5xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-200 "
                  >
                    {/* Full Card Image Background */}
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/400'} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    {/* Like & Save Buttons - Top Right */}
                    {!isOwnProfile && (
                      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                        <button 
                          onClick={(e) => handleLike(product._id, e)}
                          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${likedProducts.has(product._id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40 border border-white/20'}`}
                        >
                          <svg className="w-5 h-5" fill={likedProducts.has(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                        <button 
                          onClick={(e) => handleSave(product._id, e)}
                          className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${savedProducts.has(product._id) ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white hover:bg-white/40 border border-white/20'}`}
                        >
                          <svg className="w-5 h-5" fill={savedProducts.has(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        </button>
                      </div>
                    )}

                    {/* Category Badge - Top Left */}
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm border border-white/20">
                      {product.category}
                    </div>

                    {/* Top Right Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      {isOwnProfile && (
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${
                          product.verificationStatus === 'Verified' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          product.verificationStatus === 'Rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        }`}>
                          {product.verificationStatus}
                        </div>
                      )}
                    </div>

                    {/* Content - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end">
                      <p className="text-xs text-gray-300 font-bold uppercase tracking-widest mb-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {product.location.split(' - ')[0]}
                      </p>
                      
                      <h4 className="text-xl font-black text-white leading-tight mb-1 line-clamp-2 drop-shadow-md">
                        {product.name}
                      </h4>
                      
                      <p className="text-sm text-gray-300 font-medium mb-3">
                        {product.brand} {product.model}
                      </p>
                      
                      <div className="flex justify-between items-end mt-auto pt-2 border-t border-white/20">
                        <div>
                          <div className="flex items-end">
                            <span className="font-black text-2xl text-white">₹{product.pricePerDay}</span>
                            <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest ml-1 mb-1">/ day</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {isOwnProfile && (
                            <Link 
                              to={`/edit-product/${product._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-8 h-8 rounded-lg bg-blue-600/90 backdrop-blur-md flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-sm mt-2"
                              title="Edit"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-500 font-medium">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                            currentPage === page 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] border border-gray-200 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden border border-gray-200 relative group cursor-pointer shadow-inner">
                  {(editImagePreview || profileData.profileImage) ? (
                    <img src={editImagePreview || profileData.profileImage} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-black">{profileData.name.charAt(0)}</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Change Photo</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Bio</label>
                <textarea 
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows="3"
                  placeholder="Write something about yourself..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black tracking-wide rounded-2xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-1 flex items-center justify-center mt-2"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Quick View Modal */}
      <ProductQuickViewModal 
        isOpen={!!selectedPreviewProduct}
        onClose={() => setSelectedPreviewProduct(null)}
        product={selectedPreviewProduct}
      />

      {/* Social Connection Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] border border-gray-200 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-black text-gray-900 capitalize">
                {activeModal === 'followers' && 'Followers'}
                {activeModal === 'following' && 'Following'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-2 overflow-y-auto grow">
              {/* Followers List */}
              {activeModal === 'followers' && (
                profileData.followers?.length === 0 ? (
                  <p className="text-center text-gray-500 py-5 font-medium">No followers yet.</p>
                ) : (
                  <div className="space-y-1">
                    {profileData.followers?.map(f => (
                      <Link to={`/profile/${f._id}`} key={f._id} onClick={() => setActiveModal(null)} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-200">
                          {f.profileImage ? <img src={f.profileImage} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">{f.name?.charAt(0)}</div>}
                        </div>
                        <div className="grow overflow-hidden">
                          <p className="font-bold text-gray-900 text-sm truncate">{f.username}</p>
                          <p className="text-gray-500 text-xs truncate">{f.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {/* Following List */}
              {activeModal === 'following' && (
                profileData.following?.length === 0 ? (
                  <p className="text-center text-gray-500 py-5 font-medium">Not following anyone yet.</p>
                ) : (
                  <div className="space-y-1">
                    {profileData.following?.map(f => (
                      <Link to={`/profile/${f._id}`} key={f._id} onClick={() => setActiveModal(null)} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-200">
                          {f.profileImage ? <img src={f.profileImage} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">{f.name?.charAt(0)}</div>}
                        </div>
                        <div className="grow overflow-hidden">
                          <p className="font-bold text-gray-900 text-sm truncate">{f.username}</p>
                          <p className="text-gray-500 text-xs truncate">{f.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}


            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
