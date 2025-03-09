import { StyleCard } from "@/components/StyleCards";
import React from "react";

const page = () => {
  const categories = [
    { title: "Casual", path: "/Category/Casual", image: "/placeholder.svg" },
    { title: "Party", path: "/Category/Party", image: "/placeholder.svg" },
    { title: "Formal", path: "/Category/Formal", image: "/placeholder.svg" },
    { title: "Gym", path: "/Category/Gym", image: "/placeholder.svg" },
  ];

  return (
    <div>
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            BROWSE BY DRESS STYLE
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((category, index) => (
              <StyleCard
                key={index}
                title={category.title}
                image={category.image}
                path={category.path}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
