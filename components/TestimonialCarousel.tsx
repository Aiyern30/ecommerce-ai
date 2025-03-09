"use client";

import { useState } from "react";
import Image from "next/image";
import { useSwipeable } from "react-swipeable";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  position: string;
  content: string;
  imageSrc: string;
}

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(1);

  const testimonials: Testimonial[] = [
    {
      id: 0,
      name: "John Smith",
      position: "Marketing Director",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non duis ultricies euismod mi id sollicitudin aliquet id arcu. Nam vitae a tortor ac, sed quam quisitis ut enim.",
      imageSrc: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 1,
      name: "Selina Gomez",
      position: "CEO At Webdev Digital",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non duis ultrices quam vel dui sollicitudin aliquet id arcu. Nam vitae a enim nunc, sed sapien egestas ac nam. Tristique ultrices dolor aliquam lacus volutpat praesent.",
      imageSrc: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Robert Chen",
      position: "Product Manager",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non duis ultricies euismod mi id sollicitudin aliquet id arcu. Nam vitae a tortor ac, sed quam quisitis ut enim. Phareque duffius dolor.",
      imageSrc: "/placeholder.svg?height=80&width=80",
    },
  ];

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      setActiveIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    } else {
      setActiveIndex((prev) =>
        prev === 0 ? testimonials.length - 1 : prev - 1
      );
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">
          Our Client Say!
        </h2>

        <div className="max-w-3xl mx-auto" {...handlers}>
          <div className="flex flex-col items-center">
            {/* Profile Images */}
            <div className="flex gap-4 mb-6 justify-center">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-12 h-12 rounded-full overflow-hidden transition-all duration-300",
                    activeIndex === index
                      ? "border-2 border-[#f83d92] scale-110"
                      : "opacity-70 scale-100"
                  )}
                >
                  <Image
                    src={testimonial.imageSrc || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Testimonial Content */}
            <div className="transition-opacity duration-300">
              <h3 className="text-xl font-semibold text-center mb-1">
                {testimonials[activeIndex].name}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                {testimonials[activeIndex].position}
              </p>
              <p className="text-center text-gray-600 mb-8 max-w-2xl">
                {testimonials[activeIndex].content}
              </p>
            </div>

            {/* Indicators */}
            <div className="flex gap-2 justify-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    activeIndex === index
                      ? "w-8 bg-[#f83d92]"
                      : "w-2 bg-gray-300"
                  )}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
