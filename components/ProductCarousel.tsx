"use client";

import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { supabase } from "@/lib/supabase/client";
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
    slides: { perView: 4, spacing: 32 }, // increase spacing here
    breakpoints: {
      "(max-width: 1024px)": {
        slides: { perView: 3, spacing: 24 },
      },
      "(max-width: 768px)": {
        slides: { perView: 2, spacing: 16 },
      },
      "(max-width: 640px)": {
        slides: { perView: 1.25, spacing: 12 },
      },
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .order("created_at", { ascending: false })
        .limit(8); // maybe fetch more for a longer scroll
      if (error) console.error("Error fetching products:", error.message);
      else setProducts(data || []);
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    if (products.length > 0 && instanceRef.current) {
      instanceRef.current.update();
    }
  }, [instanceRef, products]);

  return (
    <section className="relative py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Products</h2>

        <div className="relative">
          {/* Navigation */}
          {products.length > 1 && (
            <>
              <button
                onClick={() => instanceRef.current?.prev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10 hidden lg:block"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => instanceRef.current?.next()}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10 hidden lg:block"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div ref={sliderRef} className="keen-slider px-1">
              {products.map((product) => (
                <div key={product.id} className="keen-slider__slide">
                  <div className="px-1">
                    {" "}
                    {/* extra gap inside each slide */}
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      rating={4.5}
                      reviews={20}
                      image={product.image_url}
                      href={`/products/${product.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
