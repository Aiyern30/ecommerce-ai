"use client";

import { Button, Input } from "@/components/ui";
import { ProductCard } from "@/components/ProductCards";
import { TestimonialCard } from "@/components/TestimonialCard";
import LatestBlog from "@/components/LatestBlog";
import HeroCarousel from "@/components/HeroCarousel";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col">
      <main>
        <HeroCarousel />

        {/* New Arrivals */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              NEW ARRIVALS
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              <ProductCard
                name="T-shirt with Tape Details"
                price={120}
                rating={4.5}
                reviews={145}
                image="/placeholder.svg"
              />
              <ProductCard
                name="Skinny Fit Jeans"
                price={240}
                originalPrice={260}
                rating={4.8}
                reviews={152}
                image="/placeholder.svg"
              />
              <ProductCard
                name="Checkered Shirt"
                price={180}
                rating={4.9}
                reviews={145}
                image="/placeholder.svg"
              />
              <ProductCard
                name="Sleeve Striped T-shirt"
                price={130}
                originalPrice={160}
                rating={4.9}
                reviews={125}
                image="/placeholder.svg"
              />
            </div>
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/Category/New-arrivals")}
              >
                View All
              </Button>
            </div>
          </div>
        </section>

        {/* Top Selling */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">TOP SELLING</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              <ProductCard
                name="Vertical Striped Shirt"
                price={212}
                originalPrice={232}
                rating={4.8}
                reviews={145}
                image="/placeholder.svg"
              />
              <ProductCard
                name="Courage Graphic T-shirt"
                price={145}
                rating={4.9}
                reviews={125}
                image="/placeholder.svg"
              />
              <ProductCard
                name="Loose Fit Bermuda Shorts"
                price={80}
                rating={4.7}
                reviews={105}
                image="/placeholder.svg"
              />
              <ProductCard
                name="Faded Skinny Jeans"
                price={210}
                rating={4.8}
                reviews={145}
                image="/placeholder.svg"
              />
            </div>
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/Category/Top-selling")}
              >
                View All
              </Button>
            </div>
          </div>
        </section>

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

        {/* Newsletter */}
        <section className="bg-black py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold">
                STAY UP TO DATE ABOUT OUR LATEST OFFERS
              </h2>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-white"
                />
                <Button>Subscribe to Newsletter</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
