"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";
import { Button } from "@/components/ui/";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Post } from "@/type/posts";
import { CarouselItem } from "@/type/Carousel";

function CarouselSkeleton() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex">
        <div className="w-full flex-shrink-0">
          <div className="relative flex flex-col md:flex-row items-center">
            {/* Content skeleton - shows first on mobile */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-[500px] p-6 md:p-12 bg-white/90 dark:bg-gray-800/90 order-2 md:order-1">
              <div className="max-w-xl mx-auto space-y-4">
                {/* Title skeleton */}
                <div className="space-y-2">
                  <div className="h-8 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="h-8 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
                </div>

                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
                </div>

                {/* Button skeleton */}
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Image skeleton - shows second on mobile */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-[500px] relative bg-gray-200 dark:bg-gray-700 animate-pulse order-1 md:order-2">
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

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: posts, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(4);

      if (fetchError) {
        throw fetchError;
      }

      if (!posts || posts.length === 0) {
        setCarouselItems(getDefaultCarouselItems());
        return;
      }

      const transformedItems: CarouselItem[] = posts.map((post: Post) => ({
        title: post.title,
        description: post.description || post.body.substring(0, 150) + "...",
        buttonText: post.link_name || "Read More",
        buttonLink: post.link || `/staff/posts/${post.id}`,
        imageSrc: post.image_url || "/placeholder.svg",
        imageAlt: post.title,
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
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === carouselItems.length - 1 ? 0 : prev + 1
    );
  }, [carouselItems.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselItems.length - 1 : prev - 1
    );
  };

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

  if (loading) {
    return <CarouselSkeleton />;
  }

  if (error && carouselItems.length === 0) {
    return (
      <div className="relative w-full h-[100vh] md:h-[500px] bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Unable to load carousel
            </div>
            <Button onClick={fetchPosts} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (carouselItems.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden" {...handlers}>
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselItems.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <div className="relative flex flex-col md:flex-row items-center">
              {/* Content section - shows second on mobile, first on desktop */}
              <div className="w-full md:w-1/2 h-[50vh] md:h-[500px] p-6 md:p-12 bg-white/90 dark:bg-transparent order-2 md:order-1 flex items-center">
                <div className="max-w-xl mx-auto">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 dark:text-white mb-6 text-sm md:text-base">
                    {item.description}
                  </p>
                  <Button
                    asChild
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6"
                  >
                    <Link href={item.buttonLink}>{item.buttonText}</Link>
                  </Button>
                </div>
              </div>

              {/* Image section - shows first on mobile, second on desktop */}
              <div className="w-full md:w-1/2 h-[50vh] md:h-[500px] relative order-1 md:order-2">
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

      {carouselItems.length > 1 && (
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
      )}

      {error && (
        <div className="absolute top-4 right-4 z-20">
          <Button
            onClick={fetchPosts}
            variant="outline"
            size="sm"
            className="bg-white/80 dark:bg-gray-800/80"
          >
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
