"use client";

import { TestimonialCard } from "@/components/TestimonialCard";
import LatestBlog from "@/components/LatestBlog";
import HeroCarousel from "@/components/HeroCarousel";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { UseCases } from "@/components/UseCases";
import ProductCarousel from "@/components/ProductCarousel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main>
        <HeroCarousel />
        <WhyChooseUs />
        <UseCases />
        <LatestBlog />
        <ProductCarousel />

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              OUR HAPPY CUSTOMERS
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <TestimonialCard
                name="Tan Construction Sdn Bhd"
                rating={5}
                text="YTL Concrete always delivers on time and the quality is top-notch. Our projects run smoother thanks to their reliable service."
              />
              <TestimonialCard
                name="Lee Engineering"
                rating={5}
                text="The technical support and advice from YTL's team helped us choose the right mix for our industrial site. Highly recommended!"
              />
              <TestimonialCard
                name="Maya Property Group"
                rating={5}
                text="We trust YTL Concrete for all our developments. Their consistency and professionalism set them apart in the industry."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
