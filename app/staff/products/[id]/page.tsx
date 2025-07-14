"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Edit, Trash2, Package, ArrowLeft, Search } from "lucide-react";

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
} from "@/components/ui";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import ProductDetailDisplay from "@/components/ProductDetailDisplay";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase";
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6">
        {/* Left Side - Small Thumbnails Skeleton */}
        <div className="lg:col-span-1">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="aspect-square w-16 lg:w-full flex-shrink-0 rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Middle - Large Main Image Skeleton */}
        <div className="lg:col-span-7 xl:col-span-6">
          <Skeleton className="w-full h-[500px] lg:h-[600px] rounded-lg" />
        </div>

        {/* Right Side - Product Information Skeleton */}
        <div className="lg:col-span-4 xl:col-span-5">
          <div className="border rounded-lg p-6 h-fit">
            {/* Header Skeleton */}
            <div className="pb-3 border-b">
              <div className="flex items-start justify-between gap-2 mb-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Content Skeleton */}
            <div className="pt-6 space-y-6">
              {/* Pricing & Stock Skeleton */}
              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                <Skeleton className="h-5 w-16 mb-3" />
                <Skeleton className="h-6 w-24" />
              </div>

              {/* Variants Skeleton */}
              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
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

              {/* Certifications Skeleton */}
              <div>
                <Skeleton className="h-5 w-28 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-20" />
                  ))}
                </div>
              </div>

              {/* Tags Skeleton */}
              <div>
                <Skeleton className="h-5 w-16 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-5 w-16" />
                  ))}
                </div>
              </div>

              {/* Meta Information Skeleton */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  {!isStaffView && (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-24" />
                    </div>
                  )}
                </div>
              </div>
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
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{isStaffView ? "Dashboard" : "Home"}</span>
          <span>/</span>
          <span>Products</span>
          <span>/</span>
          <span>Not Found</span>
        </div>
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
    const parts = pathname.split("/");
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
  product_images(image_url),
  product_tags(
    tags(name)
  ),
  product_certificates(certificate),
  product_variants(
    id,
    variant_type,
    price
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
      // Delete related data first
      await Promise.all([
        supabase.from("product_tags").delete().eq("product_id", product.id),
        supabase
          .from("product_certificates")
          .delete()
          .eq("product_id", product.id),
        supabase.from("product_variants").delete().eq("product_id", product.id),
        supabase.from("product_images").delete().eq("product_id", product.id),
      ]);

      // Delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) {
        console.error("Error deleting product:", error.message);
        toast.error(`Error deleting product: ${error.message}`);
      } else {
        toast.success("Product deleted successfully!");
        router.push("/staff/products");
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Check if current path is staff (for action buttons)
  const isStaffView = pathname.includes("/staff/");

  if (loading) return <ProductDetailSkeleton isStaffView={isStaffView} />;
  if (!product) return <ProductNotFound isStaffView={isStaffView} />;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Action Buttons - Only show for staff */}
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

            {/* Delete Dialog */}
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

      <ProductDetailDisplay product={product} isCustomerView={!isStaffView} />
    </div>
  );
}
