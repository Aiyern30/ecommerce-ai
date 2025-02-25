import Image from "next/image";
import { Button, Input } from "@/components/ui";
import { ProductCard } from "@/components/ProductCards";
import { StyleCard } from "@/components/StyleCards";
import { TestimonialCard } from "@/components/TestimonialCard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-[#F2F0F1] py-12 md:py-20">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  FIND CLOTHES THAT MATCHES YOUR STYLE
                </h1>
                <p className="text-lg text-muted-foreground">
                  Browse through our diverse range of meticulously crafted
                  garments, designed to bring out your individuality and cater
                  to your sense of style.
                </p>
                <Button className="w-fit" size="lg">
                  Shop Now
                </Button>
                <div className="grid grid-cols-3 gap-4 pt-8">
                  <div>
                    <p className="text-2xl font-bold">200+</p>
                    <p className="text-sm text-muted-foreground">
                      International Brands
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2,000+</p>
                    <p className="text-sm text-muted-foreground">
                      High-Quality Products
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">30,000+</p>
                    <p className="text-sm text-muted-foreground">
                      Happy Customers
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px] md:h-[500px]">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Homepage.jpg-a6iuUKfor8aTKTXZAzc1hEzs8eiKFp.jpeg"
                  alt="Fashion models wearing stylish outfits"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Brand Logos */}
        <div className="border-b py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 grayscale">
              {["Versace", "Zara", "Gucci", "Prada", "Calvin Klein"].map(
                (brand) => (
                  <div key={brand} className="text-xl font-bold tracking-wider">
                    {brand}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

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
              <Button variant="outline">View All</Button>
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
              <Button variant="outline">View All</Button>
            </div>
          </div>
        </section>

        {/* Browse by Style */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              BROWSE BY DRESS STYLE
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="grid gap-6">
                <StyleCard title="Casual" image="/placeholder.svg" />
                <StyleCard title="Party" image="/placeholder.svg" />
              </div>
              <div className="grid gap-6">
                <StyleCard title="Formal" image="/placeholder.svg" />
                <StyleCard title="Gym" image="/placeholder.svg" />
              </div>
            </div>
          </div>
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
