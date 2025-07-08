// components/WhyChooseUs.tsx
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/";

const features = [
  {
    title: "Certified Quality",
    description:
      "SIRIM-certified cement for maximum durability in every application.",
  },
  {
    title: "Affordable Pricing",
    description:
      "Competitive rates for all orders, with bulk discounts available.",
  },
  {
    title: "Fast Delivery",
    description:
      "Quick and reliable delivery to your construction site or doorstep.",
  },
  {
    title: "Trusted Supplier",
    description:
      "Supplying cement to local contractors and developers across the region.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">Why Choose Us</h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <Card
              key={index}
              className="text-center p-8 shadow-md border-gray-200 dark:border-gray-700"
            >
              <CardContent>
                <CheckCircle
                  className="text-green-600 mb-6 mx-auto"
                  size={48}
                />
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
