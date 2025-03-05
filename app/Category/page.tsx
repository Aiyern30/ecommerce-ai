import { StyleCard } from "@/components/StyleCards";
import React from "react";

const page = () => {
  return (
    <div>
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
    </div>
  );
};

export default page;
