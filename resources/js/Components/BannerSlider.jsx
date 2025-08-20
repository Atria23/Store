import React, { useState, useRef, useEffect } from "react";
import { Link } from '@inertiajs/react';

const currentDomain = window.location.origin;

const banners = [
  {
    imageUrl: "/storage/banner_home/banner_qris_converter.png",
    linkUrl: `${currentDomain}/qris-converter`
  },
  {
    imageUrl: "/storage/banner_home/banner_muvausa_otomatis.png",
  },
  {
    imageUrl: "/storage/banner_home/banner_muvausa_satset.png",
  },
  {
    imageUrl: "/storage/banner_home/banner_muvausa_game.png",
  },
  {
    imageUrl: "/storage/banner_home/banner_muvausa_payment.png",
  }
];

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (!isHovering) {
      timeoutRef.current = setTimeout(
        () =>
          setCurrentIndex((prevIndex) =>
            prevIndex === banners.length - 1 ? 0 : prevIndex + 1
          ),
        3000
      );
    }
    return () => {
      resetTimeout();
    };
  }, [currentIndex, isHovering]);

  if (banners.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? banners.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === banners.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div
      // ======================================= PERUBAHAN DI SINI =======================================
      // Rasio aspek 3:1 ditetapkan secara permanen untuk semua ukuran layar.
      className="relative w-full aspect-[3/1] rounded-lg overflow-hidden group"
      // =================================================================================================
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Wrapper untuk semua slide dengan efek transisi */}
      <div
        className="flex transition-transform ease-in-out duration-700 h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full bg-gray-200">
            {banner.linkUrl ? (
              banner.linkUrl.startsWith('/') ? (
                <Link href={banner.linkUrl} className="block w-full h-full">
                  <img src={banner.imageUrl} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                </Link>
              ) : (
                <a href={banner.linkUrl} className="block w-full h-full">
                  <img src={banner.imageUrl} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                </a>
              )
            ) : (
              <img src={banner.imageUrl} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {/* Tombol Navigasi Kiri */}
      <button
        onClick={goToPrevious}
        className="absolute z-10 top-1/2 -translate-y-1/2 left-4 h-10 w-10 flex items-center justify-center bg-white/70 text-black rounded-full shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Tombol Navigasi Kanan */}
      <button
        onClick={goToNext}
        className="absolute z-10 top-1/2 -translate-y-1/2 right-4 h-10 w-10 flex items-center justify-center bg-white/70 text-black rounded-full shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indikator Slide (Dots) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            aria-label={`Go to slide ${slideIndex + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ${currentIndex === slideIndex ? 'bg-white w-6 shadow' : 'bg-white/50 w-2'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;