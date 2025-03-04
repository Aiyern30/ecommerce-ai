import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui/";
import { Product } from "@/type/product";

interface PricingTabProps {
  products: Product[];
  itemCount: "2" | "3" | "4";
}

export function PricingTab({ products, itemCount }: PricingTabProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        itemCount === "2"
          ? "grid-cols-1 md:grid-cols-2"
          : itemCount === "3"
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {products.map((product, index) => (
        <Card
          key={product.id}
          className={cn(
            "h-full flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg",
            index === 1 ? "border-primary bg-primary/5 hover:bg-primary/10" : ""
          )}
        >
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              <div className="mt-2">
                <span className="font-bold text-2xl">{product.price}</span>
              </div>
              {index === 1 && <Badge className="mt-2">Recommended</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">What&apos;s Included</h3>
                <ul className="space-y-2">
                  {product.features
                    .filter((f) => f.available)
                    .map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature.name}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Not Included</h3>
                <ul className="space-y-2">
                  {product.features
                    .filter((f) => !f.available)
                    .map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-muted-foreground">
                          {feature.name}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={index === 1 ? "default" : "outline"}
            >
              {index === 1 ? "Buy Now" : "Learn More"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
