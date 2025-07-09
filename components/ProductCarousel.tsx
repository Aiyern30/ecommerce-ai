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
    slides: { perView: 4, spacing: 16 },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: { perView: 2, spacing: 12 },
      },
      "(max-width: 640px)": {
        slides: { perView: 1, spacing: 8 },
      },
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .order("created_at", { ascending: false })
        .limit(10);

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
          <div ref={sliderRef} className="keen-slider">
            {products.map((product) => (
              <div key={product.id} className="keen-slider__slide">
                <ProductCard
                  name={product.name}
                  price={product.price}
                  rating={4.5}
                  reviews={20}
                  image={product.image_url}
                />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute -left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-200 z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute -right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-200 z-10"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
