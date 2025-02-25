import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  rating: number;
  text: string;
}

export function TestimonialCard({ name, rating, text }: TestimonialCardProps) {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="mt-4">{text}</p>
      <p className="mt-4 font-medium">{name}</p>
    </div>
  );
}
