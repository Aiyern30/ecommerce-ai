"use client";

import { TestimonialCard } from "@/components/TestimonialCard";
import LatestBlog from "@/components/LatestBlog";
import HeroCarousel from "@/components/HeroCarousel";
import { WhyChooseUs } from "@/components/WhyChooseUs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main>
        <HeroCarousel />
        <WhyChooseUs />

        <section className="py-16">
          <LatestBlog />
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              OUR HAPPY CUSTOMERS
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <TestimonialCard
                name="Sarah M."
                rating={5}
                text="The clothes are great quality and the customer service is amazing! I love my new wardrobe!"
              />
              <TestimonialCard
                name="Alex K."
                rating={5}
                text="Finding clothes that fit my style has never been easier. Great selection and fast shipping!"
              />
              <TestimonialCard
                name="James L."
                rating={5}
                text="The quality exceeds expectations. Definitely my go-to store for fashion needs!"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
