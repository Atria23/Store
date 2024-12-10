import React, { useState } from "react";

const banners = [
  "/storage/banner_home/banner-top-up-game.webp",
  "/storage/banner_home/banner-top-up-game-2.webp",
  "/storage/banner_home/banner-top-up-game-3.webp",
];

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <img
          src={banners[currentIndex]}
          alt="Banner"
          className="w-full transition-transform duration-500 ease-in-out"
        />
      </div>
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full p-2 shadow hover:bg-gray-200"
      >
        &#8249;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full p-2 shadow hover:bg-gray-200"
      >
        &#8250;
      </button>
    </div>
  );
};

export default BannerSlider;
