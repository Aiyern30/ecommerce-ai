"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, isLoading: cartLoading } = useCart();
  const [loading, setLoading] = useState(true);

  const selectedItems = useMemo(() => {
    const selected = cartItems.filter((item) => item.selected);
    console.log("Checkout - Cart items:", cartItems.length, "Selected items:", selected.length);
    console.log("Cart items detail:", cartItems.map(item => ({ id: item.id, name: item.product?.name, selected: item.selected })));
    return selected;
  }, [cartItems]);

  useEffect(() => {
    console.log("Checkout useEffect - cartLoading:", cartLoading, "selectedItems.length:", selectedItems.length);
    
    // Wait for cart to load first
    if (cartLoading) {
      console.log("Cart still loading, waiting...");
      return;
    }

    // Give it a moment for the data to settle after loading
    const timer = setTimeout(() => {
      // Only check after cart has loaded and we've given it time to populate
      if (selectedItems.length === 0) {
        console.log("No selected items found after cart loaded, redirecting to cart");
        router.push("/cart");
        return;
      }
      
      console.log("Selected items found:", selectedItems.length, "setting loading to false");
      setLoading(false);
    }, 100); // Small delay to ensure cart data is fully loaded

    return () => clearTimeout(timer);
  }, [cartLoading, selectedItems.length, router]);

  if (cartLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No items selected</h2>
        <p className="text-gray-600 mb-6">
          Please select items from your cart to proceed with checkout
        </p>
        <Link href="/cart">
          <Button>Go to Cart</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <BreadcrumbNav
          customItems={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />

        <div className="flex items-center justify-between mt-4">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Ready to Checkout</h2>
        <p className="text-gray-600 mb-6">
          You have {selectedItems.length} item(s) selected for checkout
        </p>
        <div className="space-y-4 max-w-md mx-auto">
          <Link href="/checkout/address">
            <Button className="w-full" size="lg">
              Continue to Address
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
