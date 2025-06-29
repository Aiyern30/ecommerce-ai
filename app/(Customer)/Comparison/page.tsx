"use client";

import { useEffect, useState } from "react";
import {
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
import { Plus, X } from "lucide-react";
import Image from "next/image";

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
    <div className="flex flex-col items-center text-center relative">
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

      {/* Product Name */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </div>

      {/* Product Image */}
      <div className="mb-6">
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
      <div className="mb-4">
        <p className="text-3xl font-bold">RM{product.price.toFixed(0)}</p>
        <p className="text-sm text-muted-foreground">{product.unit}</p>
      </div>

      {/* Action Button */}
      <Button className="w-32 mb-4">VIEW DETAILS</Button>

      {/* Tags */}
      {product.product_tags && product.product_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {product.product_tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag.tags.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function AddProductCard({
  selectableProducts,
  onAddProduct,
}: {
  selectableProducts: Product[];
  onAddProduct: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-gray-400 transition-colors">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600">Add Product</p>
            <p className="text-sm text-gray-500">Compare up to 4 products</p>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[300px]">
          <p className="text-sm mb-3 font-medium">Select product to add</p>
          <Select onValueChange={onAddProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Choose product" />
            </SelectTrigger>
            <SelectContent>
              {selectableProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={
                        product.product_images?.[0]?.image_url ||
                        product.image_url ||
                        "/placeholder.svg"
                      }
                      alt={product.name}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    {product.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PopoverContent>
      </Popover>
    </div>
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
              <th className="text-left p-4 font-semibold bg-gray-50">
                Specifications
              </th>
              {products.map((product) => (
                <th
                  key={product.id}
                  className="text-center p-4 font-medium bg-gray-50 min-w-[200px]"
                >
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4 font-medium bg-gray-50">Category</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  {product.category || "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium bg-gray-50">Price</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  RM {product.price.toFixed(2)}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium bg-gray-50">Unit</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  {product.unit || "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium bg-gray-50">Stock Quantity</td>
              {products.map((product) => (
                <td key={product.id} className="text-center p-4">
                  {product.stock_quantity ?? "N/A"}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium bg-gray-50">Tags</td>
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
              <td className="p-4 font-medium bg-gray-50">Certificates</td>
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
              <td className="p-4 font-medium bg-gray-50">Description</td>
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

export default function ComparisonPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select(`
        *,
        product_images(image_url),
        product_certificates(certificate),
        product_tags(tag)
      `);

      if (error) {
        console.error("Failed to fetch products", error);
      } else {
        setProducts(data || []);
        if (data && data.length > 0) {
          setComparedIds([data[0].id]);
        }
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const addProductToCompare = (id: string) => {
    if (comparedIds.length < 4 && !comparedIds.includes(id)) {
      setComparedIds((prev) => [...prev, id]);
    }
  };

  const removeProductFromCompare = (id: string) => {
    setComparedIds((prev) => prev.filter((pid) => pid !== id));
  };

  const comparedProducts = products.filter((p) => comparedIds.includes(p.id));
  const selectableProducts = products.filter(
    (p) => !comparedIds.includes(p.id)
  );

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
            itemCount={comparedIds.length.toString() as "2" | "3" | "4"}
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
              {/* Product Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
                {comparedProducts.map((product) => (
                  <ComparisonProductCard
                    key={product.id}
                    product={product}
                    onRemove={() => removeProductFromCompare(product.id)}
                    showRemove={comparedProducts.length > 1}
                  />
                ))}

                {comparedIds.length < 4 && selectableProducts.length > 0 && (
                  <AddProductCard
                    selectableProducts={selectableProducts}
                    onAddProduct={addProductToCompare}
                  />
                )}
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
                itemCount={comparedIds.length.toString() as "2" | "3" | "4"}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
