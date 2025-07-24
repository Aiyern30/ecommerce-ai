import Image from "next/image";
import { Star } from "lucide-react";

interface RelatedProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
}

export function RelatedProductCards({
  name,
  price,
  originalPrice,
  rating,
  reviews,
}: RelatedProductCardProps) {
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src="/placeholder.svg"
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-medium">{name}</h3>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">RM{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              RM{originalPrice}
            </span>
          )}
          {originalPrice && (
            <span className="text-sm text-red-500">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
