import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui";
import ProductDetailDisplay from "@/components/ProductDetailDisplay";
import type { Product } from "@/type/product";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*, product_images(image_url), product_tags(tag), product_certificates(certificate)"
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error("Product fetch failed:", error);
    notFound();
  }

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

      <ProductDetailDisplay product={product as Product} />
    </div>
  );
}
