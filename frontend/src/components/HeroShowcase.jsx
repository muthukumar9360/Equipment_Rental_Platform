import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeroShowcase = ({ products = [] }) => {
  const navigate = useNavigate();

  // Fallback static slides
  const defaultSlides = [
    {
      _id: "1",
      name: "Rent Professional Cameras",
      category: "Cameras",
      pricePerDay: 12,
      providerId: { name: "Equipora Providers" },
      images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80"],
    },
    {
      _id: "2",
      name: "Construction Equipment",
      category: "Power Tools",
      pricePerDay: 50,
      providerId: { name: "Equipora Providers" },
      images: ["https://images.unsplash.com/photo-1541888086225-ee59cb4a5723?auto=format&fit=crop&w=900&q=80"],
    },
    {
      _id: "3",
      name: "Agricultural Machinery",
      category: "Vehicles",
      pricePerDay: 35,
      providerId: { name: "Equipora Providers" },
      images: ["https://images.unsplash.com/photo-1592982537447-6f29efc6657c?auto=format&fit=crop&w=900&q=80"],
    },
    {
      _id: "4",
      name: "Power Generators",
      category: "Power Tools",
      pricePerDay: 20,
      providerId: { name: "Equipora Providers" },
      images: ["https://images.unsplash.com/photo-1621503798950-c752672ccb64?auto=format&fit=crop&w=900&q=80"],
    }
  ];

  // Use top 4 products by trustScore, or fallback
  const dynamicSlides = products && products.length > 0 
    ? [...products].sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)).slice(0, 4)
    : defaultSlides;

  const slides = dynamicSlides;

  const [current, setCurrent] = useState(0);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Move manually
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const services = [
    {
      title: "CAMERAS",
      subtitle: "Lenses & Gear",
      color: "bg-[#EFDEC7]",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "TRACTORS",
      subtitle: "Farm Equipment",
      color: "bg-gradient-to-r from-purple-500 to-purple-700",
      img: "https://images.unsplash.com/photo-1592982537447-6f29efc6657c?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "TOOLS",
      subtitle: "Power Tools",
      color: "bg-[#B3B3B3]",
      img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "GENERATORS",
      subtitle: "Power Backup",
      color: "bg-gradient-to-r from-green-500 to-green-700",
      img: "https://images.unsplash.com/photo-1621503798950-c752672ccb64?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "DRONES",
      subtitle: "Aerial Views",
      color: "bg-gradient-to-r from-pink-500 to-pink-700",
      img: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=500&q=80",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 pt-0 mb-6 overflow-x-auto no-scrollbar w-full">
      {/* Image Slider */}
      <div className="relative w-full lg:w-[500px] h-[300px] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex-shrink-0 border-2 border-gray-200">
        
        {/* Background image with reduced opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${slides[current]?.images?.[0] || 'https://via.placeholder.com/900'})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content (full opacity) */}
        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 p-6 text-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <h2 className="text-2xl text-white font-extrabold drop-shadow-md">
              {slides[current]?.name}
            </h2>
          </div>
          <p className="text-gray-200 text-sm drop-shadow-md">Premium {slides[current]?.category} available now</p>
          <p className="text-orange-400 text-xl font-bold mt-2 drop-shadow-md">₹{slides[current]?.pricePerDay}/day</p>
          <p className="text-gray-300 text-xs mb-4 font-medium tracking-wide uppercase drop-shadow-md">Provided by {slides[current]?.providerId?.name || 'Verified User'}</p>
          <button 
            onClick={() => {
              if (slides[current]?._id.length > 5) { // Ensure it's a real mongo ID
                navigate(`/products/${slides[current]._id}`);
              }
            }}
            className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-600 shadow-md w-fit transition-colors"
          >
            Rent Now →
          </button>
        </div>

        {/* Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow z-20 transition-all focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow z-20 transition-all focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Expanding Service Cards */}
      <div className="flex gap-4 justify-center w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0 px-2 hide-scrollbar">
        {services.map((service, index) => (
          <div
            key={index}
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
            className={`relative flex flex-col justify-between rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl flex-shrink-0
    ${active === index ? "w-56" : "w-40"} h-[300px] bg-cover bg-center`}
            style={{ backgroundImage: `url(${service.img})` }}
          >
            <div className={`absolute inset-0 transition-colors duration-300 ${active === index ? 'bg-black/30' : 'bg-black/50'}`}></div>
            <div className="relative z-10 flex flex-col items-center justify-end h-full text-center text-white px-3 py-6">
              <h3 className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">{service.title}</h3>
              <p className="text-sm font-medium text-gray-200 drop-shadow-md mt-1">{service.subtitle}</p>
            </div>
            <div className={`absolute bottom-6 right-4 text-2xl font-bold z-10 transition-opacity duration-300 ${active === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroShowcase;
