/* eslint-disable react/no-unescaped-entities */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Package,
  ArrowLeft,
  Search,
  Shield,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Star,
  Calendar,
} from "lucide-react";
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
  Card,
  CardContent,
} from "@/components/ui";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Product } from "@/type/product";

// Enhanced skeleton with modern design
function ProductDetailSkeleton({ isStaffView }: { isStaffView: boolean }) {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Skeleton className="h-6 w-80" />
          {isStaffView && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>

            <Skeleton className="h-12 w-32" />

            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductNotFound({ isStaffView }: { isStaffView: boolean }) {
  const router = useRouter();

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
            <Package className="w-12 h-12 text-red-500" />
          </div>

          <TypographyH1 className="mb-4 text-gray-900 dark:text-white">
            Product Not Found
          </TypographyH1>

          <TypographyP className="text-gray-600 dark:text-gray-400 mb-8">
            The product you're looking for doesn't exist or may have been
            removed. Please check the URL or try searching for the product
            again.
          </TypographyP>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>

            <Button
              onClick={() =>
                router.push(isStaffView ? "/staff/products" : "/products")
              }
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Products
            </Button>
          </div>

          {isStaffView && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="default"
                onClick={() => router.push("/staff/products/new")}
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Add New Product
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailStaff() {
  const pathname = usePathname();
  const router = useRouter();

  const productId = useMemo(() => {
    const parts = (pathname ?? "").split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

  const isStaffView = (pathname ?? "").includes("/staff/");

  if (loading) return <ProductDetailSkeleton isStaffView={isStaffView} />;
  if (!product) return <ProductNotFound isStaffView={isStaffView} />;

  const images = product.product_images || [];
  const currentImage = images[selectedImageIndex];
  const inStock = (product.stock_quantity ?? 0) > 0;

  return (
    <div className="min-h-screen ">
      {/* Header with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Products", href: "/staff/products" },
            { label: product.name },
          ]}
        />

        {isStaffView && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
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

      {/* Main Product Section */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg sticky top-40">
            {currentImage ? (
              <Image
                src={currentImage.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="w-24 h-24" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                    selectedImageIndex === index
                      ? "border-blue-500 shadow-md scale-105"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {product.description || "High-quality construction material"}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                <Award className="w-3 h-3 mr-1" />
                {product.category || "Construction"}
              </Badge>
              <Badge
                variant={
                  product.status === "published" ? "default" : "secondary"
                }
              >
                {product.status === "published" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {product.status.charAt(0).toUpperCase() +
                  product.status.slice(1)}
              </Badge>
              {product.is_featured && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pricing Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.normal_price != null && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Normal Delivery
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    RM {Number(product.normal_price).toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                      per {product.unit || "unit"}
                    </span>
                  </div>
                </div>
              )}
              {product.pump_price != null && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pump Delivery
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    RM {Number(product.pump_price).toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                      per {product.unit || "unit"}
                    </span>
                  </div>
                </div>
              )}
              {product.tremie_1_price != null && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tremie 1
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    RM {Number(product.tremie_1_price).toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                      per {product.unit || "unit"}
                    </span>
                  </div>
                </div>
              )}
              {product.tremie_2_price != null && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tremie 2
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    RM {Number(product.tremie_2_price).toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                      per {product.unit || "unit"}
                    </span>
                  </div>
                </div>
              )}
              {product.tremie_3_price != null && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tremie 3
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    RM {Number(product.tremie_3_price).toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                      per {product.unit || "unit"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Specifications */}
          <Card className="space-y-4">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Product Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Grade
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {product.grade || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Type
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {product.product_type || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mortar Ratio
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {product.mortar_ratio || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Stock
                  </div>
                  <div
                    className={`font-semibold flex items-center gap-1 ${
                      inStock
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {inStock ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {product.stock_quantity ?? "N/A"} units
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Information */}
          <Card className="space-y-4">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Administrative Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Product ID
                    </div>
                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      {product.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Created Date
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(product.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Last Updated
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(product.updated_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Total Images
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {images.length} {images.length === 1 ? "image" : "images"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
