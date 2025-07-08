// components/UseCases.tsx
import { Hammer, Building2, Truck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/";

const useCases = [
  {
    icon: <Hammer className="text-blue-600 mb-6 mx-auto" size={48} />,
    title: "Home Renovation",
    description: "Ideal for tiling, wall plastering, and small-scale repairs.",
  },
  {
    icon: <Building2 className="text-blue-600 mb-6 mx-auto" size={48} />,
    title: "Commercial Buildings",
    description:
      "Reliable choice for office towers, malls, and high-rise projects.",
  },
  {
    icon: <Truck className="text-blue-600 mb-6 mx-auto" size={48} />,
    title: "Infrastructure",
    description:
      "Used in bridges, tunnels, and other public infrastructure projects.",
  },
  {
    icon: <Users className="text-blue-600 mb-6 mx-auto" size={48} />,
    title: "Retail Supply",
    description:
      "Resell premium cement in your local hardware or construction store.",
  },
];

export function UseCases() {
  return (
    <section className="py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">Common Use Cases</h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item, index) => (
            <Card
              key={index}
              className="text-center p-8 bg-gray-50 dark:bg-gray-900 shadow-md border-gray-200 dark:border-gray-700"
            >
              <CardContent>
                {item.icon}
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
