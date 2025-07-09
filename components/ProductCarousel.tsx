"use client";

import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCards";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 4, spacing: 24 },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: { perView: 3, spacing: 20 },
      },
      "(max-width: 768px)": {
        slides: { perView: 2, spacing: 16 },
      },
      "(max-width: 640px)": {
        slides: { perView: 1.25, spacing: 12 }, // Show 1 full + 25% of next
      },
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="relative py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Products</h2>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation buttons - positioned outside the carousel */}
          {products.length > 4 && (
            <>
              <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10 hidden lg:block"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10 hidden lg:block"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div ref={sliderRef} className="keen-slider">
              {products.map((product) => (
                <div key={product.id} className="keen-slider__slide">
                  <div className="h-80 w-full px-1 sm:px-0">
                    <ProductCard
                      name={product.name}
                      price={product.price}
                      rating={4.5}
                      reviews={20}
                      image={product.image_url}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile swipe indicator */}
          <div className="flex justify-center mt-4 sm:hidden">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
              <span>Swipe to explore more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
