import { Star, ShoppingCart, Heart, ZoomIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
}

export function ProductCard({
  name,
  price,
  originalPrice,
  rating,
  reviews,
  image,
}: ProductCardProps) {
  return (
    <Link href="#" className="group block relative h-full">
      <Card className="py-0 h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Product Image - sticks to card edges */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover Icons */}
          <div className="absolute left-4 bottom-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200">
              <ZoomIn className="h-5 w-5 text-blue-600" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200">
              <Heart className="h-5 w-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Product Details - with proper padding inside card */}
        <CardContent className="flex-1 p-4 space-y-2">
          <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
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
            <span className="font-medium">${price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
            {originalPrice && (
              <span className="text-sm text-red-500">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                OFF
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
