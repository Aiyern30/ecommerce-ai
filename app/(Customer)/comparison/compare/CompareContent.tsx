"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardContent,
} from "@/components/ui/";
import { ComparisonHeader } from "@/components/Comparison/ComparisonHeader";
import { ComparisonSummary } from "@/components/Comparison/ComparisonSummary";
import { PricingTab } from "@/components/Comparison/Tabs/PricingTab";
import type { Product } from "@/type/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

function ProductSelector({
  products,
  comparedProducts,
  onProductChange,
}: {
  products: Product[];
  comparedProducts: Product[];
  onProductChange: (index: number, newProductId: string) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Select Products to Compare</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {comparedProducts.map((product, index) => (
          <div key={index} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Product {index + 1}
            </label>
            <Select
              value={product.id}
              onValueChange={(newProductId) =>
                onProductChange(index, newProductId)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((availableProduct) => (
                  <SelectItem
                    key={availableProduct.id}
                    value={availableProduct.id}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          availableProduct.product_images?.[0]?.image_url ||
                          availableProduct.image_url ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={availableProduct.name}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                      <span className="truncate">{availableProduct.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonProductCard({
  product,
  onRemove,
  showRemove = false,
}: {
  product: Product;
  onRemove?: () => void;
  showRemove?: boolean;
}) {
  return (
    <Card className="relative h-full">
      {showRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <CardContent className="p-6 flex flex-col h-full">
        {/* Product Name */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
        </div>

        {/* Product Image */}
        <div className="flex justify-center mb-4">
          <Image
            src={
              product.product_images?.[0]?.image_url ||
              product.image_url ||
              "/placeholder.svg"
            }
            alt={product.name}
            width={200}
            height={200}
            className="w-48 h-48 object-contain rounded-lg"
          />
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <p className="text-3xl font-bold">RM{product.price.toFixed(0)}</p>
          <p className="text-sm text-muted-foreground">{product.unit}</p>
        </div>

        {/* Tags - Above the button */}
        <div className="flex-grow flex flex-col justify-end">
          {product.product_tags && product.product_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {product.product_tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag.tags.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Button - At the bottom */}
          <Button className="w-full">VIEW DETAILS</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SpecificationsTable({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-semibold">Specifications</th>
              {products.map((product) => (
                <th
                  key={product.id}
                  className="text-center p-4 font-medium min-w-[200px]"
                >
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4 font-medium">Category</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  {product.category || "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Price</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  RM {product.price.toFixed(2)}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Unit</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  {product.unit || "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Stock Quantity</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  {product.stock_quantity ?? "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Tags</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {product.product_tags && product.product_tags.length > 0 ? (
                      product.product_tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag.tags.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">No tags</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Certificates</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {product.product_certificates &&
                    product.product_certificates.length > 0 ? (
                      product.product_certificates.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cert.certificate}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">No certificates</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-medium">Description</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4 max-w-xs">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {product.description || "No description available"}
                  </p>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default function CompareProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      // Get product IDs from URL parameters and remove duplicates
      const productIds = [...new Set(searchParams.getAll("products"))];

      if (productIds.length === 0) {
        router.push("/comparison");
        return;
      }

      // If there are duplicates in URL, clean it up
      const originalIds = searchParams.getAll("products");
      if (originalIds.length !== productIds.length) {
        const params = new URLSearchParams();
        productIds.forEach((id) => params.append("products", id));
        router.replace(`/comparison/compare?${params.toString()}`);
      }

      const { data, error } = await supabase.from("products").select(`
        *,
        product_images(image_url),
        product_certificates(certificate),
        product_tags(tags(name))
      `);

      if (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
      } else {
        setProducts(data || []);
        // Filter products based on URL parameters
        const selectedProducts = (data || []).filter((p) =>
          productIds.includes(p.id)
        );
        setComparedProducts(selectedProducts);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [searchParams, router]);

  const updateURL = (productIds: string[]) => {
    // Remove duplicates before updating URL
    const uniqueIds = [...new Set(productIds)];
    const params = new URLSearchParams();
    uniqueIds.forEach((id) => params.append("products", id));
    router.replace(`/comparison/compare?${params.toString()}`);
  };

  const removeProductFromCompare = (id: string) => {
    const newIds = comparedProducts.filter((p) => p.id !== id).map((p) => p.id);
    if (newIds.length < 2) {
      router.push("/comparison");
    } else {
      setComparedProducts((prev) => prev.filter((p) => p.id !== id));
      updateURL(newIds);
    }
  };

  const changeProductAtIndex = (index: number, newProductId: string) => {
    // Check if the new product is already being compared
    const currentIds = comparedProducts.map((p) => p.id);
    if (
      currentIds.includes(newProductId) &&
      currentIds[index] !== newProductId
    ) {
      // Use toast instead of alert for better UX
      toast.error(
        "This product is already being compared. Please select a different product."
      );
      return;
    }

    const newIds = [...currentIds];
    newIds[index] = newProductId;
    const newProducts = products.filter((p) => newIds.includes(p.id));

    // Ensure products are in the same order as the IDs
    const orderedProducts = newIds
      .map((id) => newProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    setComparedProducts(orderedProducts);
    updateURL(newIds);
  };

  return (
    <div className="container mx-auto mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 w-full">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <ComparisonHeader
            itemCount={comparedProducts.length.toString() as "2" | "3" | "4"}
            setItemCount={() => {}}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
          />

          {showSummary && <ComparisonSummary products={comparedProducts} />}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              {/* Product Selectors - Above the cards */}
              <ProductSelector
                products={products}
                comparedProducts={comparedProducts}
                onProductChange={changeProductAtIndex}
              />

              {/* Product Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
                {comparedProducts.map((product, index) => (
                  <ComparisonProductCard
                    key={`${product.id}-${index}`}
                    product={product}
                    onRemove={() => removeProductFromCompare(product.id)}
                    showRemove={comparedProducts.length > 2}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-0">
              <SpecificationsTable products={comparedProducts} />
            </TabsContent>

            <TabsContent value="features" className="mt-0">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Features comparison coming soon...
                </p>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <PricingTab
                products={comparedProducts}
                itemCount={
                  comparedProducts.length.toString() as "2" | "3" | "4"
                }
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
