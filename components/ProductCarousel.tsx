"use client";

import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCards";
import { TypographyH1 } from "./ui/Typography";
import type { Product } from "@/type/product";

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 4, spacing: 32 },
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
        .select(
          `
          *,
          product_images(
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
            
        `
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8);
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
    <section className="relative h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-900 flex flex-col justify-center">
      <div className="container mx-auto px-4 flex flex-col flex-1 justify-center">
        <TypographyH1 className="text-center mb-8">Our Products</TypographyH1>
        <div className="relative">
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
              {products.map((product) => {
                // Get main image (first or is_primary)
                const mainImage =
                  product.product_images?.find((img) => img.is_primary) ||
                  product.product_images?.[0];
                return (
                  <div key={product.id} className="keen-slider__slide">
                    <div className="px-1">
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.normal_price ?? 0}
                        grade={product.grade}
                        productType={product.product_type}
                        unit={product.unit}
                        stock={product.stock_quantity}
                        image={mainImage?.image_url || "/placeholder.svg"}
                        href={`/products/${product.id}`}
                        normal_price={product.normal_price}
                        pump_price={product.pump_price}
                        tremie_1_price={product.tremie_1_price}
                        tremie_2_price={product.tremie_2_price}
                        tremie_3_price={product.tremie_3_price}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
