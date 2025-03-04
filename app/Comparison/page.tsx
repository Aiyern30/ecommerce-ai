"use client";

import { useState } from "react";
import { Check, X, ChevronRight, BarChart3 } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/";

export default function ComparisonPage() {
  const [itemCount, setItemCount] = useState<"2" | "3" | "4">("3");
  const [showSummary, setShowSummary] = useState(false);

  const products = [
    {
      id: 1,
      name: "Product A",
      price: "$199",
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "High", score: 9 },
        battery: { value: "10 hours", score: 8 },
        storage: { value: "256GB", score: 7 },
        camera: { value: "12MP", score: 8 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: true },
        { name: "Wireless charging", available: true },
        { name: "5G support", available: false },
      ],
    },
    {
      id: 2,
      name: "Product B",
      price: "$249",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "Very High", score: 10 },
        battery: { value: "8 hours", score: 6 },
        storage: { value: "512GB", score: 9 },
        camera: { value: "16MP", score: 9 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: true },
        { name: "Wireless charging", available: true },
        { name: "5G support", available: true },
      ],
    },
    {
      id: 3,
      name: "Product C",
      price: "$179",
      rating: 4.2,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "Medium", score: 7 },
        battery: { value: "12 hours", score: 9 },
        storage: { value: "128GB", score: 5 },
        camera: { value: "8MP", score: 6 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: false },
        { name: "Wireless charging", available: false },
        { name: "5G support", available: false },
      ],
    },
    {
      id: 4,
      name: "Product D",
      price: "$299",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "Ultra", score: 10 },
        battery: { value: "14 hours", score: 10 },
        storage: { value: "1TB", score: 10 },
        camera: { value: "20MP", score: 10 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: true },
        { name: "Wireless charging", available: true },
        { name: "5G support", available: true },
      ],
    },
  ];

  const displayedProducts = products.slice(0, Number.parseInt(itemCount));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Comparison</h1>
          <p className="text-muted-foreground">
            Compare features and specifications side by side
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <RadioGroup
            value={itemCount}
            onValueChange={(value) => setItemCount(value as "2" | "3" | "4")}
            className="flex gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="r2" />
              <Label htmlFor="r2">2 Items</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="r3" />
              <Label htmlFor="r3">3 Items</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="r4" />
              <Label htmlFor="r4">4 Items</Label>
            </div>
          </RadioGroup>

          <Button
            variant={showSummary ? "default" : "outline"}
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showSummary ? "Hide Summary" : "Show Summary"}
          </Button>
        </div>
      </div>

      {showSummary && (
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
                      displayedProducts.reduce((prev, current) =>
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
                      displayedProducts.reduce((prev, current) =>
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
                      displayedProducts.reduce((prev, current) =>
                        prev.specs.battery.score > current.specs.battery.score
                          ? prev
                          : current
                      ).name
                    }
                  </Badge>
                  <span className="text-muted-foreground">
                    with{" "}
                    {
                      displayedProducts.reduce((prev, current) =>
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
                    {displayedProducts[0].name}
                  </Badge>
                  <span className="text-muted-foreground">
                    at {displayedProducts[0].price}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Feature-Rich</h3>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg py-1.5 px-3">
                    {
                      displayedProducts.reduce((prev, current) =>
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
                      displayedProducts
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
              <div className="flex flex-col sm:flex-row gap-4">
                {displayedProducts.map((product, index) => (
                  <Card
                    key={product.id}
                    className={cn(
                      "flex-1 border",
                      index === 1 ? "border-primary" : "border-muted"
                    )}
                  >
                    <CardHeader
                      className={cn("pb-2", index === 1 ? "bg-primary/5" : "")}
                    >
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {index === 1 && (
                        <Badge className="w-fit">Best Overall</Badge>
                      )}
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
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">
                          {product.price}
                        </span>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
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
            {displayedProducts.map((product) => (
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
                      <Badge variant="outline">
                        Rating: {product.rating}/5
                      </Badge>
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
                          <span>
                            Performance: {product.specs.performance.value}
                          </span>
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
        </TabsContent>

        <TabsContent value="specs" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Specifications</CardTitle>
              <CardDescription>
                Compare technical specifications side by side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Specification
                      </th>
                      {displayedProducts.map((product) => (
                        <th
                          key={product.id}
                          className="text-left py-3 px-4 font-medium"
                        >
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Performance</td>
                      {displayedProducts.map((product) => (
                        <td key={product.id} className="py-3 px-4">
                          {product.specs.performance.value}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Battery Life</td>
                      {displayedProducts.map((product) => (
                        <td key={product.id} className="py-3 px-4">
                          {product.specs.battery.value}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Storage</td>
                      {displayedProducts.map((product) => (
                        <td key={product.id} className="py-3 px-4">
                          {product.specs.storage.value}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Camera</td>
                      {displayedProducts.map((product) => (
                        <td key={product.id} className="py-3 px-4">
                          {product.specs.camera.value}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Price</td>
                      {displayedProducts.map((product) => (
                        <td key={product.id} className="py-3 px-4">
                          {product.price}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>
                See which features are available in each product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Feature
                      </th>
                      {displayedProducts.map((product) => (
                        <th
                          key={product.id}
                          className="text-left py-3 px-4 font-medium"
                        >
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products[0].features.map((feature, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 font-medium">
                          {feature.name}
                        </td>
                        {displayedProducts.map((product) => (
                          <td key={product.id} className="py-3 px-4">
                            {product.features[index].available ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-0">
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
            {displayedProducts.map((product, index) => (
              <Card
                key={product.id}
                className={cn(
                  "h-full flex flex-col",
                  index === 1 ? "border-primary" : ""
                )}
              >
                <CardHeader className={cn(index === 1 ? "bg-primary/5" : "")}>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-2">
                      <span className="font-bold text-2xl">
                        {product.price}
                      </span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
