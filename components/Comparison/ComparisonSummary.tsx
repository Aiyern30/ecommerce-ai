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
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Comparison Summary</CardTitle>
        <CardDescription>
          Key differences between the selected products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Performance Winner</h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg py-1.5 px-3">
                {
                  products.reduce((prev, current) =>
                    prev.specs.performance.score >
                    current.specs.performance.score
                      ? prev
                      : current
                  ).name
                }
              </Badge>
              <span className="text-muted-foreground">
                with{" "}
                {
                  products.reduce((prev, current) =>
                    prev.specs.performance.score >
                    current.specs.performance.score
                      ? prev
                      : current
                  ).specs.performance.value
                }{" "}
                performance
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Battery Life Winner</h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg py-1.5 px-3">
                {
                  products.reduce((prev, current) =>
                    prev.specs.battery.score > current.specs.battery.score
                      ? prev
                      : current
                  ).name
                }
              </Badge>
              <span className="text-muted-foreground">
                with{" "}
                {
                  products.reduce((prev, current) =>
                    prev.specs.battery.score > current.specs.battery.score
                      ? prev
                      : current
                  ).specs.battery.value
                }{" "}
                battery life
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Best Value</h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg py-1.5 px-3">
                {products[0].name}
              </Badge>
              <span className="text-muted-foreground">
                at {products[0].price}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Feature-Rich</h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg py-1.5 px-3">
                {
                  products.reduce((prev, current) =>
                    prev.features.filter((f) => f.available).length >
                    current.features.filter((f) => f.available).length
                      ? prev
                      : current
                  ).name
                }
              </Badge>
              <span className="text-muted-foreground">
                with{" "}
                {
                  products
                    .reduce((prev, current) =>
                      prev.features.filter((f) => f.available).length >
                      current.features.filter((f) => f.available).length
                        ? prev
                        : current
                    )
                    .features.filter((f) => f.available).length
                }{" "}
                features
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
                  index === 1 ? "border-primary bg-primary/5" : "border-muted"
                )}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <span className="font-bold text-lg sm:hidden">
                      {product.price}
                    </span>
                  </div>
                  {index === 1 && <Badge className="w-fit">Best Overall</Badge>}
                  {index === 0 && (
                    <Badge variant="outline" className="w-fit">
                      Best Value
                    </Badge>
                  )}
                  {index === 2 && (
                    <Badge variant="outline" className="w-fit">
                      Budget Pick
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:gap-2 sm:flex-row items-start sm:items-center justify-between">
                  <span className="font-bold text-lg hidden sm:block">
                    {product.price}
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
