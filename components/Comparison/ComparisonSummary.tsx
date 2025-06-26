import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from "../ui";
import { Product } from "@/type/product";

interface ComparisonSummaryProps {
  products: Product[];
}

export function ComparisonSummary({ products }: ComparisonSummaryProps) {
  const bestValue = products.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr
  );

  const mostExpensive = products.reduce((prev, curr) =>
    prev.price > curr.price ? prev : curr
  );

  return (
    <Card className="mb-8 px-4">
      <CardHeader>
        <CardTitle>Comparison Summary</CardTitle>
        <CardDescription>
          Basic comparison between the selected products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Best Value</h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg py-1.5 px-3">
                {bestValue.name}
              </Badge>
              <span className="text-muted-foreground">
                RM {bestValue.price}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Most Expensive</h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg py-1.5 px-3">
                {mostExpensive.name}
              </Badge>
              <span className="text-muted-foreground">
                RM {mostExpensive.price}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-3">Overall Recommendation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <Card
                key={product.id}
                className={cn(
                  "border flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                  index === 0 ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <span className="font-bold text-lg sm:hidden">
                      RM {product.price}
                    </span>
                  </div>
                  {index === 0 && <Badge className="w-fit">Best Value</Badge>}
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:gap-2 sm:flex-row items-start sm:items-center justify-between">
                  <span className="font-bold text-lg hidden sm:block">
                    RM {product.price}
                  </span>
                  <Button size="sm" className="w-full sm:w-auto">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
