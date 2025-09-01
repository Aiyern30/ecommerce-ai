"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";
import { Button } from "@/components/ui/";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { Post } from "@/type/posts";
import { CarouselItem } from "@/type/carousel";
import { useDeviceType } from "@/utils/useDeviceTypes";

function CarouselSkeleton() {
  return (
    <div className="relative w-full h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex h-full">
        <div className="w-full flex-shrink-0 h-full">
          <div className="relative flex flex-col md:flex-row items-center h-full">
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-12 bg-white/90 dark:bg-gray-800/90 order-2 md:order-1 flex items-center">
              <div className="max-w-xl mx-auto space-y-4 w-full">
                <div className="space-y-2">
                  <div className="h-8 md:h-12 lg:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="h-8 md:h-12 lg:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 md:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 md:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 md:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
                </div>
                <div className="h-12 md:h-14 w-36 md:w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-gray-200 dark:bg-gray-700 animate-pulse order-1 md:order-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useDeviceType();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: posts, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (!posts || posts.length === 0) {
        setCarouselItems(getDefaultCarouselItems());
        return;
      }

      const transformedItems: CarouselItem[] = posts.map((post: Post) => ({
        title: post.title,
        description: post.description || post.mobile_description || "",
        buttonText: post.link_name || "Read More",
        buttonLink: post.link || `/staff/posts/${post.id}`,
        imageSrc: post.image_url || "/placeholder.svg",
        imageAlt: post.title,
        mobile_description: post.mobile_description || undefined,
      }));

      setCarouselItems(transformedItems);
    } catch (err) {
      console.error("Error fetching posts for carousel:", err);
      setError("Failed to load carousel content");
      setCarouselItems(getDefaultCarouselItems());
    } finally {
      setLoading(false);
    }
  }, []);

  const getDefaultCarouselItems = (): CarouselItem[] => [
    {
      title: "Welcome to Our Platform",
      description:
        "Discover our latest content and stay updated with our newest posts.",
      buttonText: "Explore",
      buttonLink: "/staff/posts",
      imageSrc: "/placeholder.svg?height=500&width=800",
      imageAlt: "Welcome banner",
    },
  ];

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const goToSlide = (index: number) => {
    // Wrap index for infinite loop
    const total = carouselItems.length;
    const wrappedIndex = ((index % total) + total) % total;
    setCurrentSlide(wrappedIndex);
    setIsAutoPlaying(false);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  }, [carouselItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  }, [carouselItems.length]);

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  useEffect(() => {
    if (!isAutoPlaying || carouselItems.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, carouselItems.length]);

  if (loading) return <CarouselSkeleton />;
  if (error && carouselItems.length === 0) return null;
  if (carouselItems.length === 0) return null;

  return (
    <div
      className="relative w-full h-[calc(100vh-120px)] overflow-hidden"
      {...handlers}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselItems.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            <div className="relative flex flex-col md:flex-row items-center h-full">
              {/* Left side: Text content */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-12 lg:p-16 bg-white/90 dark:bg-transparent order-2 md:order-1 flex items-center">
                <div className="max-w-2xl mx-auto w-full">
                  {isMobile ? (
                    <TypographyH3 className="text-gray-800 dark:text-white mb-4 md:mb-6 leading-tight">
                      {item.title}
                    </TypographyH3>
                  ) : (
                    <TypographyH1 className="text-gray-800 dark:text-white mb-4 md:mb-6 leading-tight">
                      {item.title}
                    </TypographyH1>
                  )}

                  <TypographyP className="text-gray-600 dark:text-white mb-6 md:mb-8 text-base md:text-lg lg:text-xl leading-relaxed">
                    {isMobile && item.mobile_description
                      ? item.mobile_description
                      : item.description}
                  </TypographyP>

                  <div className={isMobile ? "flex justify-center" : "block"}>
                    <Button
                      asChild
                      className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-3 sm:px-8 sm:py-6"
                    >
                      {item.buttonLink.includes("http") ? (
                        <a
                          href={item.buttonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.buttonText}
                        </a>
                      ) : (
                        <Link href={item.buttonLink}>{item.buttonText}</Link>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right side: Image */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative order-1 md:order-2">
                <Image
                  src={item.imageSrc || "/placeholder.svg"}
                  alt={item.imageAlt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:hidden"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots: Only show on medium and larger screens */}
      {carouselItems.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:flex space-x-3 z-20">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 hover:scale-110",
                // Light: bg-black, Dark: bg-gray-400, Active: wider and orange
                currentSlide === index
                  ? "bg-orange-500 w-8 md:w-10 shadow-lg"
                  : "bg-black/30 dark:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Left Arrow */}
      {carouselItems.length > 1 && (
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 block"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Right Arrow */}
      {carouselItems.length > 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-110 block"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
