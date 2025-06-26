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
                <span className="font-bold text-2xl">RM {product.price}</span>
              </div>
              {index === 1 && <Badge className="mt-2">Recommended</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-2">
            <p className="text-muted-foreground">{product.description}</p>
            <p>Category: {product.category}</p>
            <p>Unit: {product.unit}</p>
            <p>Stock: {product.stock_quantity}</p>
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
