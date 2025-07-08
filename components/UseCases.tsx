// components/WhyChooseUs.tsx
import { Hammer, Building2, Truck, Users } from "lucide-react";

const useCases = [
  {
    icon: <Hammer className="text-blue-600 mb-4 mx-auto" size={32} />,
    title: "Home Renovation",
    description: "Ideal for tiling, wall plastering, and small-scale repairs.",
  },
  {
    icon: <Building2 className="text-blue-600 mb-4 mx-auto" size={32} />,
    title: "Commercial Buildings",
    description:
      "Reliable choice for office towers, malls, and high-rise projects.",
  },
  {
    icon: <Truck className="text-blue-600 mb-4 mx-auto" size={32} />,
    title: "Infrastructure",
    description:
      "Used in bridges, tunnels, and other public infrastructure projects.",
  },
  {
    icon: <Users className="text-blue-600 mb-4 mx-auto" size={32} />,
    title: "Retail Supply",
    description:
      "Resell premium cement in your local hardware or construction store.",
  },
];

export function UseCases() {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Common Use Cases</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 shadow-sm"
            >
              {item.icon}
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
