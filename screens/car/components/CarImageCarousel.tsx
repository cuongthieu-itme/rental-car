"use client";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface CarImageCarouselProps {
  carData?: {
    images: string | string[];
    name: string;
    [key: string]: any;
  };
}

const CarImageCarousel: React.FC<CarImageCarouselProps> = ({ carData }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Parse images from carData
  const getImages = () => {
    if (!carData?.images) {
      return ["/images/car-1.png"]; // fallback image
    }

    if (typeof carData.images === "string") {
      try {
        const parsed = JSON.parse(carData.images);
        return Array.isArray(parsed) ? parsed : [carData.images];
      } catch {
        return [carData.images];
      }
    }

    return Array.isArray(carData.images) ? carData.images : ["/images/car-1.png"];
  };

  const images = getImages();

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="bg-muted-foreground min-h-[495px] relative rounded-xl overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        opts={{
          loop: true,
          align: "start",
        }}
        className="w-full max-lg:px-4 aspect-video"
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="w-full aspect-video">
              <Image
                priority={index === 0}
                src={image}
                alt={`${carData?.name || 'Car'} - Image ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = "/images/car-1.png";
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute w-full flex items-center justify-center bottom-5">
        {images.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-2 h-2 rounded-full mx-1 p-0 ${
              selectedIndex === index ? "bg-foreground" : "bg-foreground/20"
            }`}
            onClick={() => api && api.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            title={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarImageCarousel;
