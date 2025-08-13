"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Edit, Trash2, Package, ArrowLeft, Search } from "lucide-react";
import Image from "next/image";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
  Badge,
} from "@/components/ui";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Product } from "@/type/product";

// Product Detail Skeleton Component
function ProductDetailSkeleton({ isStaffView }: { isStaffView: boolean }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb and Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Action Buttons Skeleton - Only show for staff */}
        {isStaffView && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
          </div>
        )}
      </div>

      {/* Product Detail Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Product Information Skeleton */}
        <div className="border rounded-lg p-6 h-fit">
          {/* Header Skeleton */}
          <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {/* Product Name Skeleton */}
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-8 w-3/4" />
              </div>

              {/* Description Skeleton */}
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Category Skeleton */}
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Status Skeleton - Only show for staff */}
              {isStaffView && (
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-6 w-16" />
                </div>
              )}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="pt-6 space-y-6">
            {/* Pricing & Stock Skeleton */}
            <div>
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-6 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-5 w-16 mb-1" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Skeleton */}
            <div>
              <Skeleton className="h-4 w-16 mb-3" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Variants Skeleton */}
            <div>
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Information Skeleton */}
            {!isStaffView && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Skeleton className="h-3 w-32 mb-2" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Images Skeleton */}
        <div className="space-y-4">
          {/* Main Image Skeleton */}
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="w-full aspect-[4/3] rounded-lg" />
          </div>

          {/* Thumbnails Skeleton */}
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-square w-16 flex-shrink-0 rounded-md"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Not Found Component
function ProductNotFound({ isStaffView }: { isStaffView: boolean }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <BreadcrumbNav
          customItems={[
            {
              label: isStaffView ? "Dashboard" : "Home",
              href: isStaffView ? "/staff/dashboard" : "/",
            },
            {
              label: "Products",
              href: isStaffView ? "/staff/products" : "/products",
            },
            { label: "Not Found" },
          ]}
        />
      </div>

      {/* Not Found Content */}
      <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[500px]">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>

        <TypographyH1 className="mb-2">Product Not Found</TypographyH1>

        <TypographyP className="text-muted-foreground text-center mb-2 max-w-md">
          The product you&apos;re looking for doesn&apos;t exist or may have
          been removed.
        </TypographyP>

        <TypographyP className="text-sm text-muted-foreground text-center mb-8 max-w-md">
          Please check the URL or try searching for the product again.
        </TypographyP>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button
            onClick={() =>
              router.push(isStaffView ? "/staff/products" : "/products")
            }
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Button>
        </div>

        {isStaffView && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-md">
            <TypographyP className="text-center text-sm text-muted-foreground mb-4">
              Need to add a new product?
            </TypographyP>
            <Button
              variant="default"
              onClick={() => router.push("/staff/products/new")}
              className="w-full flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Add New Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailClient() {
  const pathname = usePathname();
  const router = useRouter();

  const productId = useMemo(() => {
    const parts = (pathname ?? "").split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
            *,
            product_images(
              id,
              image_url,
              alt_text,
              is_primary,
              sort_order
            )
          `
        )
        .eq("id", productId)
        .single();

      if (error || !data) {
        console.error("Product fetch failed:", error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    if (productId) fetchProduct();
  }, [productId]);

  const handleDeleteProduct = async () => {
    if (!product) return;

    setIsDeleting(true);

    try {
      const res = await fetch("/api/admin/products/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error("Failed to delete product: " + result.error);
        return;
      }

      toast.success("Product deleted successfully!");
      router.push("/staff/products");
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Check if current path is staff (for action buttons)
  const isStaffView = (pathname ?? "").includes("/staff/");

  if (loading) return <ProductDetailSkeleton isStaffView={isStaffView} />;
  if (!product) return <ProductNotFound isStaffView={isStaffView} />;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <BreadcrumbNav
            customItems={[
              {
                label: "Dashboard",
                href: isStaffView ? "/staff/dashboard" : "/",
              },
              {
                label: "Products",
                href: isStaffView ? "/staff/products" : "/products",
              },
              { label: product.name },
            ]}
          />
        </div>
        {isStaffView && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/staff/products/${product.id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this product? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Product"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Product Info */}
        <div className="border rounded-lg p-6 h-fit space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-muted-foreground mb-2">
              {product.description || "No description"}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">
                {product.category || "No Category"}
              </Badge>
              <Badge
                variant={
                  product.status === "published" ? "default" : "secondary"
                }
              >
                {product.status.charAt(0).toUpperCase() +
                  product.status.slice(1)}
              </Badge>
              {product.is_featured && <Badge variant="default">Featured</Badge>}
            </div>
            <div className="text-xs text-gray-500">
              Created: {new Date(product.created_at).toLocaleString()}
              <br />
              Updated: {new Date(product.updated_at).toLocaleString()}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-1">Grade</div>
              <div>{product.grade}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Product Type</div>
              <div>{product.product_type}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Mortar Ratio</div>
              <div>{product.mortar_ratio || "N/A"}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Unit</div>
              <div>{product.unit || "N/A"}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Stock Quantity</div>
              <div>{product.stock_quantity ?? "N/A"}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Is Featured</div>
              <div>{product.is_featured ? "Yes" : "No"}</div>
            </div>
          </div>
          <div>
            <div className="font-medium mb-2">Pricing</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="font-semibold">Normal Price:</span>{" "}
                {product.normal_price !== null &&
                product.normal_price !== undefined
                  ? `RM ${Number(product.normal_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Pump Price:</span>{" "}
                {product.pump_price !== null && product.pump_price !== undefined
                  ? `RM ${Number(product.pump_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Tremie 1 Price:</span>{" "}
                {product.tremie_1_price !== null &&
                product.tremie_1_price !== undefined
                  ? `RM ${Number(product.tremie_1_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Tremie 2 Price:</span>{" "}
                {product.tremie_2_price !== null &&
                product.tremie_2_price !== undefined
                  ? `RM ${Number(product.tremie_2_price).toFixed(2)}`
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Tremie 3 Price:</span>{" "}
                {product.tremie_3_price !== null &&
                product.tremie_3_price !== undefined
                  ? `RM ${Number(product.tremie_3_price).toFixed(2)}`
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
        {/* Right Side - Images */}
        <div className="space-y-4">
          <div>
            <div className="font-medium mb-2">Main Image</div>
            {product.product_images && product.product_images.length > 0 ? (
              <div className="relative w-full aspect-[4/3] rounded-lg border overflow-hidden">
                <Image
                  src={product.product_images[0].image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 512px, 100vw"
                  priority
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div>
            <div className="font-medium mb-2">Additional Images</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.product_images && product.product_images.length > 1 ? (
                product.product_images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="relative w-24 h-24 rounded-md border overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={img.image_url}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="96px"
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No additional images</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
