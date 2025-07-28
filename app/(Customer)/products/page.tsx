"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCards";

type SimpleProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
};

export default function ProductListPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load products");
        console.error(error);
      } else {
        setProducts(data || []);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const handleCompareToggle = (id: string, add: boolean) => {
    setSelectedIds((prev) =>
      add ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      const params = new URLSearchParams();
      selectedIds.forEach((id) => params.append("products", id));
      router.push(`/compare?${params.toString()}`);
    } else {
      toast.info("Select at least 2 products to compare");
    }
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {/* Compare buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
        >
          Compare ({selectedIds.length})
        </button>
        <button
          onClick={clearSelection}
          disabled={selectedIds.length === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              rating={4.5}
              reviews={20}
              image={product.image_url ?? "/placeholder.svg"}
              href={`/products/${product.id}`}
              showCompare
              onCompareToggle={handleCompareToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}
