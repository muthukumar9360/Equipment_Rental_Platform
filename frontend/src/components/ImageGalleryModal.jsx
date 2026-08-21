import React, { useEffect } from 'react';

const ImageGalleryModal = ({ isOpen, onClose, product }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Ensure we have an array of images (mocking at least 8 to show off the beautiful unique grid)
  const baseImages = product.images && product.images.length > 0 
    ? product.images 
    : [
        'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513251703273-db987b50875e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80'
      ];
  
  // Pad with images to demonstrate the full grid if the product has less than 8
  const images = [...baseImages, ...baseImages].slice(0, 8);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} on Equipora!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Unique Asymmetrical Grid Layout Logic
  const getGridClasses = (index) => {
    const layoutIdx = index % 8;
    switch(layoutIdx) {
      case 0: return "col-span-12 md:col-span-12 row-span-2 h-[250px] md:h-[350px]"; // Massive Hero
      case 1: return "col-span-12 md:col-span-7 row-span-2 h-[250px] md:h-[300px]"; // Left heavy
      case 2: return "col-span-12 md:col-span-5 row-span-2 h-[250px] md:h-[300px]"; // Right light
      case 3: return "col-span-12 md:col-span-4 row-span-1 h-[200px] md:h-[300px]"; // 1/3 Split
      case 4: return "col-span-12 md:col-span-4 row-span-1 h-[200px] md:h-[300px]"; // 1/3 Split
      case 5: return "col-span-12 md:col-span-4 row-span-1 h-[200px] md:h-[300px]"; // 1/3 Split
      case 6: return "col-span-12 md:col-span-5 row-span-2 h-[250px] md:h-[300px]"; // Left light
      case 7: return "col-span-12 md:col-span-7 row-span-2 h-[250px] md:h-[300px]"; // Right heavy
      default: return "col-span-12 h-[300px]";
    }
  };

  return (
    // Outer Overlay with Blur
    <div className="fixed inset-0 z-[200] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in">
      
      {/* The Floating Window Modal */}
      <div className="bg-[#f8f9fa] w-full max-w-[1000px] h-[85vh] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col relative overflow-hidden border border-white/50">
        
        {/* Floating Header inside the window */}
        <div className="absolute top-0 w-full z-20 flex items-center justify-between px-6 md:px-8 py-5 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
          <div className="flex-1">
            <h3 className="text-sm md:text-base font-black text-gray-900 tracking-widest uppercase">
              {product.name}
            </h3>
          </div>
          
          <div className="flex justify-end items-center space-x-3">
            <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-full transition-all shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-all shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] border border-gray-200/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content inside the Window */}
        <div className="flex-1 overflow-y-auto pt-20 pb-5 px-2 md:px-8 lg:px-8 scroll-smooth">
          <div className="max-w-[1200px] mx-auto">
            
            {/* Window Grid Container */}
            <div className="grid grid-cols-12 gap-3 md:gap-5 auto-rows-auto">
              {images.map((img, index) => (
                <div 
                  key={index} 
                  className={`${getGridClasses(index)} rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gray-200 group relative shadow-sm hover:shadow-xl transition-all duration-700`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${index}`} 
                    className="w-full h-full object-cover transform transition-transform duration-[2s] ease-out group-hover:scale-[1.03]" 
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageGalleryModal;
