// components/WhyChooseUs.tsx
import { CheckCircle } from "lucide-react";

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
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Choose Us</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm"
            >
              <CheckCircle className="text-green-600 mb-4 mx-auto" size={32} />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
