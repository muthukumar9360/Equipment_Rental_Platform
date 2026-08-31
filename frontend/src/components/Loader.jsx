import React from 'react';

const Loader = ({ type = 'fullpage', text = 'Loading...' }) => {
  if (type === 'fullpage') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="relative flex flex-col items-center">
          
          {/* Main Spinning Rings */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-purple-600 border-b-transparent animate-[spin_1.5s_linear_reverse_infinite]"></div>
          </div>
          
          {/* Branding / Text */}
          <div className="mt-8 text-center">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">Equipora</h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">{text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'section') {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-100 to-purple-100 animate-pulse"></div>
          <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-r-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{text}</p>
      </div>
    );
  }

  if (type === 'skeleton-card') {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-[1.5rem] mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-8 bg-gray-200 rounded-xl w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
        </div>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        <span>{text}</span>
      </div>
    );
  }

  return null;
};

export default Loader;
