"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui";
import ProductDetailDisplay from "@/components/ProductDetailDisplay";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/type/product";

export default function ProductDetailClient() {
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

  if (loading) return <div>Loading product...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Product Details</h1>
          <Link href="/staff/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>

      <ProductDetailDisplay product={product} />
    </div>
  );
}
