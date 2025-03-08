"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/";
import { cn } from "@/lib/utils";

interface CarouselItem {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  imageAlt: string;
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const carouselItems: CarouselItem[] = [
    {
      title: "Transform Your Home with Elegant Furniture",
      description:
        "Discover our curated selection of stylish and durable furniture pieces. Whether you're looking for modern minimalism or classic charm, we have the perfect fit for your space.",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/elegant-living-room-set.png",
      imageAlt: "Modern living room with stylish furniture",
    },
    {
      title: "Comfort Meets Design in Every Piece",
      description:
        "Experience furniture that combines aesthetics with functionality. From cozy sofas to ergonomic chairs, our collection ensures comfort without compromising on style.",
      buttonText: "Explore Collection",
      buttonLink: "/collection",
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cozy-sofa-set.png",
      imageAlt: "Comfortable sofa set in a well-lit room",
    },
    {
      title: "Sustainable and Eco-Friendly Choices",
      description:
        "Our furniture is crafted using sustainable materials, ensuring an eco-conscious choice for your home. Elevate your space while caring for the planet.",
      buttonText: "Go Green",
      buttonLink: "/sustainable",
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eco-friendly-furniture.png",
      imageAlt: "Eco-friendly wooden dining table with chairs",
    },
    {
      title: "Expert Craftsmanship, Built to Last",
      description:
        "We take pride in delivering high-quality furniture made by skilled artisans. Every piece is designed for durability, elegance, and everyday comfort.",
      buttonText: "Learn More",
      buttonLink: "/about-us",
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/handcrafted-furniture.png",
      imageAlt: "Artisan working on a wooden furniture piece",
    },
  ];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === carouselItems.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselItems.length]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselItems.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <div className="relative flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 p-6 md:p-12 bg-white/90 z-10">
                <div className="max-w-xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 mb-6">{item.description}</p>
                  <Button
                    asChild
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6"
                  >
                    <Link href={item.buttonLink}>{item.buttonText}</Link>
                  </Button>
                </div>
              </div>

              <div className="w-full md:w-1/2 h-[300px] md:h-[500px] relative">
                <Image
                  src={item.imageSrc || "/placeholder.svg"}
                  alt={item.imageAlt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              currentSlide === index
                ? "bg-blue-500 w-8"
                : "bg-gray-400 hover:bg-gray-600"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
