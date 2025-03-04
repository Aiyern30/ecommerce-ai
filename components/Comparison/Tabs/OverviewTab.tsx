import Image from "next/image";
import { ChevronRight } from "lucide-react";
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

interface OverviewTabProps {
  products: Product[];
  itemCount: "2" | "3" | "4";
}

export function OverviewTab({ products, itemCount }: OverviewTabProps) {
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
      {products.map((product) => (
        <Card key={product.id} className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={200}
                height={200}
                className="rounded-md object-cover"
              />
            </div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-xl">{product.price}</span>
                <Badge variant="outline">Rating: {product.rating}/5</Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Key Specs</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span>Performance: {product.specs.performance.value}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span>Battery: {product.specs.battery.value}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span>Storage: {product.specs.storage.value}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">View Details</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
