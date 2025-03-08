"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      title: "Built for Your Business, Designed for Success",
      description:
        "Discover heavy-duty vehicles engineered for strength, endurance, and efficiency. Designed to deliver exceptional performance in logistics and construction, ensuring affordability and reliability for every job.",
      buttonText: "Learn more",
      buttonLink: "/learn-more",
      imageSrc:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4qds0DTFicVeC0YBzdvfp81hYzjCag.png",
      imageAlt:
        "Green heavy-duty trucks parked in front of a building with palm trees",
    },
    {
      title: "Powerful Performance, Reliable Results",
      description:
        "Our fleet of industrial-grade vehicles combines cutting-edge technology with robust engineering. Experience unmatched power and precision for your most demanding projects.",
      buttonText: "View fleet",
      buttonLink: "/fleet",
      imageSrc: "/placeholder.svg?height=600&width=800",
      imageAlt: "Industrial vehicles showcase",
    },
    {
      title: "Sustainable Solutions for Modern Industry",
      description:
        "Embrace eco-friendly operations without compromising on power. Our latest models feature reduced emissions and improved fuel efficiency while maintaining superior performance.",
      buttonText: "Explore options",
      buttonLink: "/sustainable",
      imageSrc: "/placeholder.svg?height=600&width=800",
      imageAlt: "Eco-friendly industrial vehicles",
    },
    {
      title: "Expert Support, Whenever You Need It",
      description:
        "Our dedicated team provides comprehensive maintenance and technical support. Count on us for rapid response and professional service to keep your operations running smoothly.",
      buttonText: "Contact us",
      buttonLink: "/contact",
      imageSrc: "/placeholder.svg?height=600&width=800",
      imageAlt: "Support team with vehicles",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === carouselItems.length - 1 ? 0 : prev + 1
    );
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselItems.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
  };

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
                <div className="max-w-xl">
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

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

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
