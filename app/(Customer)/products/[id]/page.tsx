"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui";
import ProductDetailDisplay from "@/components/ProductDetailDisplay";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/type/product";

export default function PublicProductDetailPage() {
  const pathname = usePathname();

  const productId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px] px-4">
        Loading product...
      </div>
    );
  if (!product)
    return (
      <div className="flex justify-center items-center min-h-[400px] px-4">
        Product not found.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
      <div className="flex flex-col gap-6 w-full max-w-full">
        <div className="flex flex-col gap-2">
          <BreadcrumbNav
            customItems={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: product.name },
            ]}
          />

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Product Details</h1>
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>

        <ProductDetailDisplay product={product} isCustomerView={true} />
      </div>
    </div>
  );
}
