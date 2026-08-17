import React from 'react';

const activities = [
  {
    id: 1,
    title: 'Sony A7III Rented',
    location: 'Chennai',
    user: 'Alex M.',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    rating: 5,
    text: 'Great camera in perfect condition. The provider was very helpful and the Equipora Trust Passport gave me peace of mind.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    title: 'DJI Mavic 3 Pro Rented',
    location: 'Los Angeles',
    user: 'Sarah K.',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    rating: 5,
    text: 'Amazing drone! Used it for a real estate shoot. The handover process was seamless and the condition was exactly as described.',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    title: 'Canon EOS R5 Rented',
    location: 'Chicago',
    user: 'Michael T.',
    avatar: 'https://i.pravatar.cc/150?u=mike',
    rating: 4,
    text: 'Very smooth rental experience. The AI inspection checklist at return made everything very transparent.',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 4,
    title: 'Rode Wireless GO II Rented',
    location: 'Houston',
    user: 'Emily R.',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    rating: 5,
    text: 'Perfect audio equipment. Quick verification and immediate availability. Highly recommend this provider.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400'
  }
];

const RecentActivity = () => {
  return (
    <div className="py-4 my-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-6">
        <div>
          <h3 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Recent <span className="text-blue-600">Activities</span></h3>
          <p className="text-gray-500 mt-2 font-medium">Recent rentals happening across the Equipora network.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
        {activities.map((activity, index) => {
          let layoutClass = '';
          if (index === 0) layoutClass = 'md:col-span-2 md:row-span-2';
          else if (index === 1) layoutClass = 'md:col-span-2 md:row-span-1';
          else layoutClass = 'md:col-span-1 md:row-span-1';

          return (
            <div key={activity.id} className={`group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 ${layoutClass} ${index === 0 ? 'h-[400px] md:h-full' : 'h-[240px] md:h-full'}`}>
              <div className="absolute inset-0 bg-gray-900">
                <img src={activity.image} alt={activity.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-700" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent mix-blend-multiply"></div>
              
              <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-4 group-hover:translate-y-0">
                 <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center border border-white/30">
                  <svg className="w-3 h-3 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                  Just Rented
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-lg">
                    {activity.location}
                  </span>
                  <span className="text-gray-300 text-sm font-semibold flex items-center backdrop-blur-sm bg-black/20 px-3 py-1 rounded-md">
                    <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Verified Owner
                  </span>
                </div>
                <h4 className={`font-black text-white leading-tight ${index === 0 ? 'text-3xl md:text-5xl mb-2' : 'text-2xl mb-1'}`}>
                  {activity.title}
                </h4>
                {index === 0 && (
                  <p className="text-gray-300 mt-2 font-medium max-w-md hidden md:block">
                    This premium gear was just picked up by a verified creator in {activity.location}. Rent identical items from our verified network today.
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
