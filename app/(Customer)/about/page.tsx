/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import { Truck, Award, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/";
import { useRouter } from "next/navigation";
import { FeatureCard } from "@/components/FeatureCards";
import { TestimonialCard } from "@/components/TestimonialCard";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  rating: number;
  text: string;
}

export default function AboutYTLConcrete() {
  const router = useRouter();
  const features: Feature[] = [
    {
      icon: Truck,
      title: "Reliable Delivery",
      description:
        "We ensure timely and safe delivery of concrete to your construction site, every time.",
    },
    {
      icon: Award,
      title: "Superior Quality",
      description:
        "Our concrete products meet the highest industry standards for strength and durability.",
    },
    {
      icon: ShieldCheck,
      title: "Sustainable Solutions",
      description:
        "YTL Concrete is committed to eco-friendly practices and sustainable building materials.",
    },
    {
      icon: Users,
      title: "Expert Support",
      description:
        "Our experienced team provides technical advice and customer support throughout your project.",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Tan, Project Manager",
      rating: 5,
      text: "YTL Concrete delivered on time and exceeded our expectations for quality. Their team was professional and supportive throughout our project.",
    },
    {
      name: "Lee, Contractor",
      rating: 5,
      text: "We rely on YTL Concrete for all our developments. Their sustainable approach and technical expertise set them apart.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image
              src="/YTL_Concrete.jpg"
              alt="YTL Concrete construction site"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <TypographyH1 className="text-3xl md:text-4xl font-bold text-[#2a3990]">
              About YTL Concrete
            </TypographyH1>
            <TypographyP>
              YTL Concrete is Malaysia's leading supplier of ready-mixed
              concrete, serving the nation's infrastructure and building needs
              for over 30 years. We deliver innovative concrete solutions for
              residential, commercial, and industrial projects, ensuring
              quality, reliability, and sustainability in every batch.
            </TypographyP>
            <TypographyP>
              Our commitment to excellence is reflected in our state-of-the-art
              batching plants, rigorous quality control, and a dedicated team of
              professionals. Whether you are building a home, a skyscraper, or a
              highway, YTL Concrete is your trusted partner for all concrete
              requirements.
            </TypographyP>
            <Button onClick={() => router.push("/Contact")}>
              Contact YTL Concrete
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-24">
          <TypographyH1 className="text-3xl font-bold text-center mb-16">
            Why Choose YTL Concrete?
          </TypographyH1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="mb-24">
          <TypographyH3 className="text-2xl font-bold text-center mb-10">
            What Our Clients Say
          </TypographyH3>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard
                key={idx}
                name={testimonial.name}
                rating={testimonial.rating}
                text={testimonial.text}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-[#2a3990]">
            Ready to build with YTL Concrete?
          </h2>
          <Button size="lg" onClick={() => router.push("/contact")}>
            Get in Touch
          </Button>
        </div>
      </div>
    </div>
  );
}
