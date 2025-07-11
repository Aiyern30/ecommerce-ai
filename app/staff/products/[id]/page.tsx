"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import ProductDetailDisplay from "@/components/ProductDetailDisplay";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Product } from "@/type/product";

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

  if (loading) return <div>Loading product...</div>;
  if (!product) return <div>Product not found.</div>;

  // Check if current path is staff (for action buttons)
  const isStaffView = pathname.includes("/staff/");

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
