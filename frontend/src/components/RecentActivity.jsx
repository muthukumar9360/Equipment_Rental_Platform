import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecentActivity = ({ products = [] }) => {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // 1. Try to load from localStorage
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed'));
      if (viewed && viewed.length > 0) {
        setRecentActivities(viewed.slice(0, 4));
        return;
      }
    } catch (e) {
      console.error(e);
    }
    
    // 2. Fallback to 4 DB products (e.g., newest or random)
    if (products.length > 0) {
      // Sort by creation date descending if available, else just take 4
      const fallback = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
      setRecentActivities(fallback);
    }
  }, [products]);

  if (recentActivities.length === 0) return null;

  return (
    <div className="py-4 my-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-6">
        <div>
          <h3 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Recent <span className="text-blue-600">Activities</span></h3>
          <p className="text-gray-500 mt-2 font-medium">Recent rentals happening across the Equipora network.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
        {recentActivities.map((activity, index) => {
          let layoutClass = '';
          if (index === 0) layoutClass = 'md:col-span-2 md:row-span-2';
          else if (index === 1) layoutClass = 'md:col-span-2 md:row-span-1';
          else layoutClass = 'md:col-span-1 md:row-span-1';

          return (
            <div 
              key={activity._id || index} 
              onClick={() => navigate(`/products/${activity._id}`)}
              className={`group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer ${layoutClass} ${index === 0 ? 'h-[400px] md:h-full' : 'h-[240px] md:h-full'}`}
            >
              <div className="absolute inset-0 bg-gray-900">
                <img src={activity.images?.[0] || 'https://via.placeholder.com/400'} alt={activity.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-700" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent mix-blend-multiply"></div>
              
              <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-4 group-hover:translate-y-0">
                 <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center border border-white/30">
                  <svg className="w-3 h-3 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                  Recently Viewed
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-lg">
                    {activity.location ? activity.location.split(' - ')[0] : 'Remote'}
                  </span>
                  <span className="text-gray-300 text-sm font-semibold flex items-center backdrop-blur-sm bg-black/20 px-3 py-1 rounded-md">
                    <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Verified Owner
                  </span>
                </div>
                <h4 className={`font-black text-white leading-tight ${index === 0 ? 'text-3xl md:text-5xl mb-2' : 'text-2xl mb-1'}`}>
                  {activity.name}
                </h4>
                {index === 0 && (
                  <p className="text-gray-300 mt-2 font-medium max-w-md hidden md:block">
                    This premium gear was just listed by {activity.providerId?.name || 'a verified creator'} in {activity.location}. Rent identical items from our verified network today.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
