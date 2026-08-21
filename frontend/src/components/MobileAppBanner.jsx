import React from 'react';

const MobileAppBanner = () => {
  return (
    <section className="w-full max-w-8xl mx-auto px-8 mt-28 mb-12">
      <div className="bg-[#333333] rounded-[2.5rem] w-full flex flex-col-reverse lg:flex-row items-center px-8 lg:px-50 pb-12 lg:pb-0 relative shadow-2xl">
        
        {/* Left: Phone Image (Popping out) */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start lg:-mt-16 relative z-10">
          <div className="w-[280px] h-[550px] bg-white rounded-[3rem] border-[12px] border-[#1c1c1e] shadow-2xl overflow-hidden relative flex flex-col">
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center">
              <div className="w-32 h-6 bg-[#1c1c1e] rounded-b-3xl"></div>
            </div>
            
            {/* Fake App Content */}
            <div className="flex-1 bg-green-50/50 pt-10 px-4 pb-4 overflow-y-auto">
              
              {/* Fake Search Bar */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex-1 bg-white rounded-full h-10 px-4 flex items-center shadow-sm border border-gray-100">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  <span className="text-gray-400 text-xs font-medium">Search for "Cameras"</span>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                  <span className="text-xl">🔔</span>
                </div>
              </div>

              {/* Fake Banner */}
              <div className="text-center mb-6">
                <p className="text-green-700 font-bold text-xs uppercase tracking-widest mb-1">Rent Equipments Now</p>
                <h3 className="text-2xl font-black text-[#1c1c1e] leading-tight" style={{textShadow: "1px 1px 0px #4ade80, -1px -1px 0px #4ade80, 1px -1px 0px #4ade80, -1px 1px 0px #4ade80"}}>
                  Rent Daily
                  <br/>
                  Anywhere - Anytime
                </h3>
                <p className="text-gray-500 text-[10px] mt-2 font-medium">🎥 1200+ Rentals today</p>
              </div>

              {/* Fake Cards */}
              <h4 className="font-bold text-gray-800 text-sm mb-3">Top Categories</h4>
              <div className="flex space-x-3 mb-4">
                <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 h-28 flex flex-col justify-between relative overflow-hidden">
                   <div>
                     <p className="font-bold text-[#1c1c1e] text-xs">Daily Rent</p>
                     <p className="text-[9px] text-gray-500 mt-1">4+ Hours • Unlimited</p>
                   </div>
                   <div className="absolute -bottom-2 -right-2 text-4xl opacity-50">📷</div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 h-28 flex flex-col justify-between relative overflow-hidden">
                   <div>
                     <p className="font-bold text-[#1c1c1e] text-xs">Subscription</p>
                     <p className="text-[9px] text-gray-500 mt-1">7+ days</p>
                   </div>
                   <div className="absolute -bottom-2 -right-2 text-4xl opacity-50">🚜</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right: Text and Buttons */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 lg:py-20 text-center lg:text-left">
          <p className="text-gray-300 text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-4">
            Experience convenience at your fingertips:
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-10 tracking-tight">
            Get Our Mobile App!
          </h2>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            
            {/* Apple App Store */}
            <button className="flex items-center space-x-3 bg-black hover:bg-gray-900 border border-gray-700 transition-colors px-5 py-2.5 rounded-xl text-white">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.365 14.363c0-4.63 3.714-6.425 3.864-6.527-2.148-3.155-5.46-3.567-6.666-3.626-2.825-.286-5.526 1.666-6.96 1.666-1.42 0-3.64-1.638-5.962-1.593-3.036.046-5.83 1.764-7.39 4.498-3.167 5.485-.806 13.585 2.274 18.064 1.503 2.188 3.264 4.636 5.617 4.544 2.247-.09 3.107-1.455 5.818-1.455 2.694 0 3.483 1.455 5.86 1.41 2.42-.047 3.94-2.234 5.426-4.428 1.716-2.518 2.422-4.966 2.46-5.092-.055-.022-4.342-1.664-4.342-6.46zM13.633 4.88c1.233-1.492 2.062-3.57 1.836-5.63-1.77.07-3.924 1.18-5.188 2.672-1.125 1.32-2.115 3.444-1.84 5.465 1.97.153 3.962-.994 5.192-2.507z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] leading-tight text-gray-300">Download on the</p>
                <p className="text-lg font-bold leading-tight">App Store</p>
              </div>
            </button>

            {/* Google Play */}
            <button className="flex items-center space-x-3 bg-black hover:bg-gray-900 border border-gray-700 transition-colors px-5 py-2.5 rounded-xl text-white">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M11.66 12L2.73 21.05A2.65 2.65 0 012 19.34V4.66a2.65 2.65 0 01.73-1.71L11.66 12z" />
                <path fill="#FBBC04" d="M15.42 15.82L11.66 12l-8.93-9.05a2.63 2.63 0 011.53-.18l12.44 7.1c1.35.77 1.35 2.02 0 2.79l-1.28.76z" />
                <path fill="#4285F4" d="M11.66 12l3.76 3.82-1.28.76-12.44 7.1a2.63 2.63 0 01-1.53-.18L11.66 12z" />
                <path fill="#34A853" d="M15.42 15.82l1.28-.76c1.35-.77 1.35-2.02 0-2.79l-1.28-.76-3.76 3.82 3.76 4.49z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] leading-tight text-gray-300">GET IT ON</p>
                <p className="text-lg font-bold leading-tight">Google Play</p>
              </div>
            </button>

            {/* Indus Appstore */}
            <button className="flex items-center space-x-3 bg-black hover:bg-gray-900 border border-gray-700 transition-colors px-5 py-2.5 rounded-xl text-white">
              <div className="flex flex-col items-center justify-center space-y-1 w-6 h-6">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-b-full opacity-80 -mt-2"></div>
                <div className="w-4 h-4 bg-pink-500 rounded-b-full opacity-60 -mt-2"></div>
              </div>
              <div className="text-left">
                <p className="text-[10px] leading-tight text-gray-300">Download on</p>
                <p className="text-lg font-bold leading-tight">Indus Appstore</p>
              </div>
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};

export default MobileAppBanner;
