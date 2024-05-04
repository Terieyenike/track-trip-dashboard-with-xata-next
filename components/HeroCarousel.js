"use client";

import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

const heroImages = [
  { imgUrl: "/assets/pexels-teri-eyenike-94012-6354164.jpg", alt: "kayaking" },
  {
    imgUrl: "/assets/pexels-francesco-ungaro-19857034.jpg",
    alt: "duck on water",
  },
  { imgUrl: "/assets/pexels-pixabay-208745.jpg", alt: "golden gate bridge" },
  {
    imgUrl: "/assets/pexels-officialakfotos-18556827.jpg",
    alt: "adomi bridge",
  },
  {
    imgUrl: "/assets/pexels-andrea-roman-291935393-15475219.jpg",
    alt: "hill in black and white",
  },
];

export default function HeroCarousel() {
  return (
    <div className='py-5 mt-8'>
      <Carousel
        showThumbs={false}
        infiniteLoop
        showArrows={false}
        showStatus={false}
        className='relative'>
        {heroImages.map((image, index) => (
          <div key={index} className='relative h-full'>
            <div className='absolute inset-0 bg-black opacity-50 rounded-lg'></div>
            <Image
              alt={image.alt}
              src={image.imgUrl}
              width={484}
              height={484}
              layout='responsive'
              objectFit='cover'
              className='rounded-lg'
            />
            <div className='absolute inset-0 flex items-center justify-center text-white'>
              <h2 className='text-2xl font-bold'>{image.alt}</h2>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
