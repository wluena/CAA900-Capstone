import React, { useState, useEffect } from 'react';

const FeaturedCarousel = ({ ads, onShopNow }) => {
  const [current, setCurrent] = useState(0);

  // Auto-play logic
  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(timer);
  }, [ads]);

  // Reset index if ads change (e.g. during filtering)
  useEffect(() => {
    setCurrent(0);
  }, [ads?.length]);

  if (!ads || ads.length === 0) {
    return <div className="h-[500px] bg-zinc-100 animate-pulse rounded-3xl" />;
  }

  const currentAd = ads[current];

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-zinc-900 text-white rounded-3xl group">
      <div className="container mx-auto h-full flex flex-col md:flex-row items-center justify-between px-12">
        
        {/* Content */}
        <div className="flex-1 space-y-4 z-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <span className="text-rose-500 font-black uppercase tracking-[0.3em] text-xs">
            Featured Deal
          </span>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
            {currentAd.name}
          </h1>
          <p className="text-zinc-400 max-w-md line-clamp-2 text-sm font-medium">
            {currentAd.description}
          </p>
          <button 
            onClick={() => onShopNow(currentAd.productId)}
            className="mt-6 px-10 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
          >
            Shop Now — ${currentAd.price}
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 flex justify-center items-center h-full relative">
          <img 
            key={currentAd.productId} // Key helps trigger animation on slide change
            src={currentAd.imageUrl || currentAd.image_url} 
            alt={currentAd.name} 
            className="max-h-[70%] object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.2)] animate-in zoom-in-95 duration-700"
          />
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 right-12 flex gap-2">
        {ads.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-300 ${current === i ? 'w-12 bg-rose-500' : 'w-4 bg-zinc-700 hover:bg-zinc-500'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;