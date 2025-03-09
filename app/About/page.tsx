"use client";

import Image from "next/image";
import { Truck, Coins, Award, Headphones } from "lucide-react";
import { Button } from "@/components/ui/";
import { useRouter } from "next/navigation";
import { FeatureCard } from "@/components/FeatureCards";
import TestimonialCarousel from "@/components/TestimonialCarousel";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

export default function AboutUs() {
  const router = useRouter();
  const features: Feature[] = [
    {
      icon: Truck,
      title: "Free Delivery",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus gravida.",
    },
    {
      icon: Coins,
      title: "100% Cash Back",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus gravida.",
    },
    {
      icon: Award,
      title: "Quality Product",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus gravida.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa purus gravida.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
        <div className="relative w-full h-[300px] md:h-[400px]">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Dj90L7YB1EjDNWVdMXPghvhq30ULe9.png"
            alt="Business professionals shaking hands"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2a3990]">
            Know About Our Ecommerce Business, History
          </h1>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mattis
            neque ultricies mattis aliquam, malesuada diam est. Malesuada sem
            tristique amet erat vitae eget dolor lobortis. Accumsan faucibus
            vitae lobortis quis bibendum quam.
          </p>
          <Button onClick={() => router.push("/Contact")}>Contact us</Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-16">Our Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Testimonial Section */}

      <TestimonialCarousel />
    </div>
  );
}
