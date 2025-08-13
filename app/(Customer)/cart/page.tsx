"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Skeleton,
} from "@/components/ui";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { toast } from "sonner";
import { CheckoutSummary } from "@/components/Checkout/CheckoutSummary";
import { useCart } from "@/components/CartProvider";
import {
  updateCartItemQuantity,
  removeFromCart,
  updateCartItemSelection,
  selectAllCartItems,
  getProductPrice,
} from "@/lib/cart/utils";
import { useUser } from "@supabase/auth-helpers-react";
import type { CartItem } from "@/type/cart";
import { useDeviceType } from "@/utils/useDeviceTypes";
import { supabase } from "@/lib/supabase/browserClient";

interface AdditionalService {
  id: string;
  service_name: string;
  service_code: string;
  rate_per_m3: number;
  description: string;
  is_active: boolean;
}

interface FreightCharge {
  id: string;
  min_volume: number;
  max_volume: number | null;
  delivery_fee: number;
  description: string;
  is_active: boolean;
}

export default function CartPage() {
  const { cartItems, refreshCart, isLoading } = useCart();
  console.log("cartItems", cartItems);
  const { isMobile } = useDeviceType();
  const user = useUser();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // Additional services and freight charges state
  const [additionalServices, setAdditionalServices] = useState<
    AdditionalService[]
  >([]);
  const [freightCharges, setFreightCharges] = useState<FreightCharge[]>([]);
  const [selectedServices, setSelectedServices] = useState<{
    [key: string]: boolean;
  }>({});
  const [servicesLoading, setServicesLoading] = useState(true);

  // Calculate select all state from database
  const selectAll =
    cartItems.length > 0 && cartItems.every((item) => item.selected);
  const selectedItems = cartItems.filter((item) => item.selected);

  // Calculate total volume of selected items
  const totalVolume = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Fetch additional services and freight charges
  useEffect(() => {
    const fetchServicesAndCharges = async () => {
      try {
        setServicesLoading(true);

        // Fetch additional services
        const { data: services, error: servicesError } = await supabase
          .from("additional_services")
          .select("*")
          .eq("is_active", true)
          .order("service_name");

        // Fetch freight charges
        const { data: charges, error: chargesError } = await supabase
          .from("freight_charges")
          .select("*")
          .eq("is_active", true)
          .order("min_volume");

        if (servicesError) {
          console.error("Error fetching additional services:", servicesError);
        } else {
          setAdditionalServices(services || []);
          console.log("additionalServices", services);
        }

        if (chargesError) {
          console.error("Error fetching freight charges:", chargesError);
        } else {
          setFreightCharges(charges || []);
        }

        // Load selected services from localStorage
        const savedServices = localStorage.getItem("selectedServices");
        if (savedServices) {
          try {
            setSelectedServices(JSON.parse(savedServices));
          } catch (error) {
            console.error("Error parsing saved services:", error);
            localStorage.removeItem("selectedServices");
          }
        }
      } catch (error) {
        console.error("Error fetching services and charges:", error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServicesAndCharges();
  }, []);

  // Clear selected services if cart is empty
  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      localStorage.removeItem("selectedServices");
      setSelectedServices({});
    }
  }, [cartItems.length, isLoading]);

  // Helper function to get variant display name
  const getVariantDisplayName = (variantType: string | null | undefined) => {
    switch (variantType) {
      case "pump":
        return "Pump Delivery";
      case "tremie_1":
        return "Tremie 1";
      case "tremie_2":
        return "Tremie 2";
      case "tremie_3":
        return "Tremie 3";
      case "normal":
      case null:
      case undefined:
      default:
        return "Normal Delivery";
    }
  };

  // Handle individual item selection
  const handleItemSelect = async (itemId: string, checked: boolean) => {
    const success = await updateCartItemSelection(itemId, checked);
    if (success) {
      await refreshCart();
    } else {
      toast.error("Failed to update selection");
    }
  };

  // Handle select all
  const handleSelectAll = async (checked: boolean) => {
    if (!user?.id) return;
    const success = await selectAllCartItems(user.id, checked);
    if (success) {
      await refreshCart();
      toast.success(checked ? "All items selected" : "All items deselected");
    } else {
      toast.error("Failed to update selection");
    }
  };

  // Handle service selection with localStorage
  const handleServiceSelect = (serviceCode: string, checked: boolean) => {
    const newSelectedServices = {
      ...selectedServices,
      [serviceCode]: checked,
    };

    setSelectedServices(newSelectedServices);

    // Save to localStorage
    localStorage.setItem(
      "selectedServices",
      JSON.stringify(newSelectedServices)
    );

    if (checked) {
      toast.success("Service added to your order", {
        duration: 2000,
        style: { background: "#16a34a", color: "#fff" },
      });
    } else {
      toast.success("Service removed from your order", {
        duration: 2000,
        style: { background: "#ef4444", color: "#fff" },
      });
    }
  };

  // Handle delete click
  const handleDeleteClick = (item: CartItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (itemToDelete) {
      await removeFromCart(itemToDelete.id);
      refreshCart();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success("Item removed from cart!", {
        duration: 3000,
        style: { background: "#16a34a", color: "#fff" },
      });
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    await updateCartItemQuantity(itemId, newQuantity);
    refreshCart();
  };

  // Handle proceed to checkout with validation
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to proceed with checkout", {
        duration: 4000,
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }
    // Go directly to the address step
    router.push("/checkout/address");
  };

  // Local state for quantity input per item
  const [inputQty, setInputQty] = useState<{ [id: string]: string }>({});

  // Sync inputQty state with cartItems when cartItems change
  useEffect(() => {
    const qtyState: { [id: string]: string } = {};
    cartItems.forEach((item) => {
      qtyState[item.id] = String(item.quantity);
    });
    setInputQty(qtyState);
  }, [cartItems]);
  return (
    <div className="min-h-screen mb-4">
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">YOUR CART</TypographyH1>

        {isLoading ? (
          <div
            className={`mt-8 grid gap-8 ${isMobile ? "" : "lg:grid-cols-3"}`}
          >
            {/* Cart Items Skeleton */}
            <div className={isMobile ? "" : "lg:col-span-2"}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-7 w-48" />
                  <div className="ml-auto">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="p-6">
                      <div className="flex gap-4">
                        <div className="flex items-start pt-3">
                          <Skeleton className="h-5 w-5 rounded" />
                        </div>
                        <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-xl flex-shrink-0" />
                        <div className="flex flex-1 flex-col justify-between min-h-[96px] md:min-h-[112px]">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div className="flex-1 pr-4 space-y-2">
                              <Skeleton className="h-7 w-64" />
                              <div className="flex gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                            <Skeleton className="h-9 w-9 rounded-lg ml-auto md:ml-0" />
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-10 w-28 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Order Summary Skeleton */}
            {!isMobile && (
              <div className="lg:col-span-1 self-start sticky top-28">
                <CheckoutSummary
                  showCheckoutButton={true}
                  selectedServices={selectedServices}
                  totalVolume={totalVolume}
                />
              </div>
            )}
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Login Required
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Please login to view your cart and start shopping for amazing
                products.
              </p>
            </div>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground max-w-sm">
                Discover our amazing products and add them to your cart to get
                started.
              </p>
            </div>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div
            className={`mt-8 ${
              isMobile ? "space-y-6" : "grid gap-8 lg:grid-cols-3"
            }`}
          >
            {/* Cart Items */}
            <div className={isMobile ? "" : "lg:col-span-2 space-y-6"}>
              {/* Products Section */}
              <Card className="overflow-hidden shadow-sm py-0 gap-0">
                {/* Choose All Product Header */}
                <CardHeader
                  className={`${
                    isMobile ? "p-4" : "p-6"
                  } bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={(checked) => {
                          handleSelectAll(checked === true);
                        }}
                        className="h-5 w-5"
                      />
                      <CardTitle
                        className={`${
                          isMobile ? "text-lg" : "text-xl"
                        } font-bold cursor-pointer`}
                      >
                        Choose All Product
                      </CardTitle>
                    </div>
                    <TypographyP
                      className={`text-sm text-gray-600 dark:text-gray-400 font-medium !mt-0 ${
                        isMobile ? "hidden" : ""
                      }`}
                    >
                      {selectedItems.length} of {cartItems.length} items
                      selected
                    </TypographyP>
                  </div>
                  {/* Mobile: Show selection count below on mobile */}
                  {isMobile && (
                    <TypographyP className="text-xs text-gray-600 dark:text-gray-400 font-medium !mt-2">
                      {selectedItems.length} of {cartItems.length} items
                      selected
                    </TypographyP>
                  )}
                </CardHeader>
                {/* Product Items */}
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cartItems.map((item) => {
                      // Get the correct price based on variant_type
                      const itemPrice = getProductPrice(
                        item.product,
                        item.variant_type
                      );

                      const itemInputQty =
                        inputQty[item.id] ?? String(item.quantity);

                      return (
                        <div
                          key={item.id}
                          className={`${
                            isMobile ? "p-4" : "p-6"
                          } hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all duration-200 cursor-pointer group`}
                          onClick={(e) => {
                            // Only navigate if not clicking on interactive elements
                            const target = e.target as HTMLElement;
                            if (
                              !target.closest("button") &&
                              !target.closest("input") &&
                              !target.closest("a")
                            ) {
                              router.push(`/products/${item.product_id}`);
                            }
                          }}
                        >
                          <div
                            className={`flex ${isMobile ? "gap-3" : "gap-4"}`}
                          >
                            {/* Checkbox for individual item */}
                            <div
                              className={`flex items-start ${
                                isMobile ? "pt-2" : "pt-3"
                              }`}
                            >
                              <Checkbox
                                id={`item-${item.id}`}
                                checked={item.selected}
                                onCheckedChange={(checked) =>
                                  handleItemSelect(item.id, checked as boolean)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 w-5"
                              />
                            </div>
                            {/* Product Image */}
                            <div
                              className={`relative ${
                                isMobile
                                  ? "h-20 w-20"
                                  : "h-24 w-24 md:h-28 md:w-28"
                              } flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700`}
                            >
                              <Image
                                src={
                                  item.product?.image_url || "/placeholder.svg"
                                }
                                alt={item.product?.name || "Product"}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            {/* Product Details */}
                            <div
                              className={`flex flex-1 flex-col justify-between ${
                                isMobile
                                  ? "min-h-[80px]"
                                  : "min-h-[96px] md:min-h-[112px]"
                              }`}
                            >
                              <div
                                className={`flex ${
                                  isMobile
                                    ? "flex-col"
                                    : "flex-col md:flex-row md:justify-between md:items-start"
                                }`}
                              >
                                <div className="flex-1 pr-2">
                                  <TypographyH3
                                    className={`font-bold ${
                                      isMobile
                                        ? "text-base leading-tight"
                                        : "text-xl"
                                    } mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
                                  >
                                    {item.product?.name}
                                  </TypographyH3>
                                  {!isMobile && (
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-gray-500 dark:text-gray-400">
                                      <span>
                                        Size: {item.product?.unit || "per bag"}
                                      </span>
                                      <span className="hidden md:inline">
                                        •
                                      </span>
                                      <span>
                                        {getVariantDisplayName(
                                          item.variant_type
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* Delete Button - Positioned differently on mobile */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(item);
                                  }}
                                  className={`text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200 ${
                                    isMobile
                                      ? "absolute top-2 right-2 opacity-70"
                                      : "ml-auto md:ml-0 opacity-0 group-hover:opacity-100"
                                  }`}
                                  aria-label="Remove item"
                                >
                                  <Trash2
                                    className={`${
                                      isMobile ? "h-4 w-4" : "h-5 w-5"
                                    }`}
                                  />
                                </button>
                              </div>
                              {/* Mobile: Product details */}
                              {isMobile && (
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                  <span>
                                    Size: {item.product?.unit || "per bag"}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {getVariantDisplayName(item.variant_type)}
                                  </span>
                                </div>
                              )}
                              {/* Price and Quantity Controls */}
                              <div
                                className={`flex items-center justify-between ${
                                  isMobile ? "mt-2" : "mt-4"
                                }`}
                              >
                                <div
                                  className={`${
                                    isMobile ? "text-lg" : "text-2xl"
                                  } font-bold text-gray-900 dark:text-gray-100`}
                                >
                                  RM{itemPrice.toFixed(2)}
                                </div>
                                {/* Quantity Controls */}
                                <div
                                  className={`flex items-center bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm ${
                                    isMobile ? "scale-90" : ""
                                  }`}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.quantity === 1) {
                                        handleDeleteClick(item);
                                      } else {
                                        updateQuantity(
                                          item.id,
                                          item.quantity - 1
                                        );
                                      }
                                    }}
                                    className={`p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-l-lg group${
                                      item.quantity === 1
                                        ? " text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        : ""
                                    }`}
                                    aria-label={
                                      item.quantity === 1
                                        ? "Remove item"
                                        : "Decrease quantity"
                                    }
                                  >
                                    <Minus
                                      className={`${
                                        isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
                                      } group-hover:scale-110 transition-transform duration-200`}
                                    />
                                  </button>
                                  {/* Number input for quantity */}
                                  <input
                                    type="number"
                                    min={1}
                                    value={itemInputQty}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      // Allow empty string for typing, but only positive numbers
                                      if (/^\d*$/.test(val)) {
                                        setInputQty((prev) => ({
                                          ...prev,
                                          [item.id]: val,
                                        }));
                                      }
                                    }}
                                    onBlur={() => {
                                      let val = parseInt(itemInputQty, 10);
                                      if (isNaN(val) || val < 1) val = 1;
                                      if (val !== item.quantity) {
                                        updateQuantity(item.id, val);
                                      }
                                      setInputQty((prev) => ({
                                        ...prev,
                                        [item.id]: String(val),
                                      }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        (e.target as HTMLInputElement).blur();
                                      }
                                    }}
                                    className={`appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                  ${
                    isMobile
                      ? "w-10 px-1 py-1.5 text-xs"
                      : "w-12 px-2 py-2 text-sm"
                  }
                  font-bold text-center text-gray-900 dark:text-gray-100 border-x border-gray-200 dark:border-gray-600 outline-none bg-transparent`}
                                    aria-label="Quantity"
                                    style={{
                                      MozAppearance: "textfield",
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(
                                        item.id,
                                        item.quantity + 1
                                      );
                                    }}
                                    // Optionally disable if at stock limit
                                    disabled={
                                      typeof item.product?.stock_quantity ===
                                        "number" &&
                                      item.quantity >=
                                        item.product.stock_quantity
                                    }
                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-r-lg group disabled:opacity-50"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus
                                      className={`${
                                        isMobile ? "h-3 w-3" : "h-3.5 w-3.5"
                                      } group-hover:scale-110 transition-transform duration-200`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Additional Services Section */}
              {selectedItems.length > 0 && (
                <Card className="overflow-hidden shadow-lg border-2 border-blue-100 dark:border-blue-900">
                  <CardHeader
                    className={`${
                      isMobile ? "p-4" : "p-6"
                    } bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-700`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle
                          className={`${
                            isMobile ? "text-lg" : "text-xl"
                          } font-bold text-blue-900 dark:text-blue-100`}
                        >
                          Additional Services
                        </CardTitle>
                        <TypographyP className="text-sm text-blue-700 dark:text-blue-300 !mt-1">
                          Enhance your concrete order with optional services
                        </TypographyP>
                      </div>
                    </div>

                    {/* Volume Display */}
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Volume Selected:
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {totalVolume.toFixed(2)} m³
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Service charges are calculated per cubic meter
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className={`${isMobile ? "p-4" : "p-6"}`}>
                    {servicesLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-5 w-5 rounded" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                              </div>
                            </div>
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : additionalServices.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Info className="h-8 w-8 text-gray-400" />
                        </div>
                        <TypographyP className="text-gray-500 dark:text-gray-400">
                          No additional services available at this time
                        </TypographyP>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {additionalServices.map((service, index) => {
                          const serviceTotal =
                            service.rate_per_m3 * totalVolume;
                          const isSelected =
                            selectedServices[service.service_code] || false;

                          return (
                            <div
                              key={service.id}
                              className={`relative p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                              onClick={() =>
                                handleServiceSelect(
                                  service.service_code,
                                  !isSelected
                                )
                              }
                            >
                              {/* Selected Badge */}
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  Added
                                </div>
                              )}

                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <Checkbox
                                    id={`service-${service.service_code}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                      handleServiceSelect(
                                        service.service_code,
                                        checked as boolean
                                      )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-5 w-5 mt-1"
                                  />

                                  <div className="flex-1">
                                    <label
                                      htmlFor={`service-${service.service_code}`}
                                      className={`font-semibold cursor-pointer block transition-colors ${
                                        isSelected
                                          ? "text-blue-700 dark:text-blue-300"
                                          : "text-gray-900 dark:text-gray-100"
                                      }`}
                                    >
                                      {service.service_name}
                                    </label>

                                    {service.description && (
                                      <p
                                        className={`text-sm mt-1 transition-colors ${
                                          isSelected
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-400"
                                        }`}
                                      >
                                        {service.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-2 mt-2">
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          isSelected
                                            ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                        }`}
                                      >
                                        RM{service.rate_per_m3.toFixed(2)} per
                                        m³
                                      </span>
                                      {totalVolume > 0 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          × {totalVolume.toFixed(2)} m³
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div
                                    className={`font-bold text-lg transition-colors ${
                                      isSelected
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    RM{serviceTotal.toFixed(2)}
                                  </div>
                                  {isSelected && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      Added to total
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Service Index for visual appeal */}
                              <div
                                className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isSelected
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {index + 1}
                              </div>
                            </div>
                          );
                        })}

                        {/* Services Summary */}
                        {Object.values(selectedServices).some(Boolean) && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-green-800 dark:text-green-200">
                                  Services Total
                                </h4>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  {
                                    Object.keys(selectedServices).filter(
                                      (key) => selectedServices[key]
                                    ).length
                                  }{" "}
                                  service(s) selected
                                </p>
                              </div>
                              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                RM
                                {additionalServices
                                  .reduce((sum, service) => {
                                    if (
                                      selectedServices[service.service_code]
                                    ) {
                                      return (
                                        sum + service.rate_per_m3 * totalVolume
                                      );
                                    }
                                    return sum;
                                  }, 0)
                                  .toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary with Checkout Button */}
            <div className={isMobile ? "" : "lg:col-span-1"}>
              <div className={isMobile ? "" : "sticky top-6 z-10"}>
                <CheckoutSummary
                  showCheckoutButton={true}
                  onCheckout={handleProceedToCheckout}
                  checkoutButtonText="Proceed to Checkout"
                  checkoutButtonDisabled={selectedItems.length === 0}
                  selectedServices={selectedServices}
                  totalVolume={totalVolume}
                  additionalServices={additionalServices}
                  freightCharges={freightCharges}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={`${isMobile ? "max-w-sm mx-4" : "max-w-md"}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={`${isMobile ? "text-base" : "text-lg"} font-semibold`}
            >
              Remove item from cart?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`text-gray-600 dark:text-gray-400 ${
                isMobile ? "text-sm" : ""
              }`}
            >
              Are you sure you want to remove this item from your cart? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {itemToDelete && (
            <div
              className={`flex gap-4 ${
                isMobile ? "p-3" : "p-4"
              } border rounded-xl bg-gray-50 dark:bg-gray-900`}
            >
              <div
                className={`${
                  isMobile ? "h-12 w-12" : "h-16 w-16"
                } bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0`}
              >
                <Image
                  src={itemToDelete.product?.image_url || "/placeholder.svg"}
                  alt={itemToDelete.product?.name || "Product"}
                  width={isMobile ? 48 : 64}
                  height={isMobile ? 48 : 64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4
                  className={`font-semibold ${
                    isMobile ? "text-xs" : "text-sm"
                  } mb-1 text-gray-900 dark:text-gray-100`}
                >
                  {itemToDelete.product?.name}
                </h4>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-blue-600 dark:text-blue-400 mb-1`}
                >
                  {getVariantDisplayName(itemToDelete.variant_type)}
                </p>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-gray-600 dark:text-gray-400 mb-1`}
                >
                  Quantity: {itemToDelete.quantity}
                </p>
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } font-semibold text-gray-900 dark:text-gray-100`}
                >
                  RM
                  {(
                    getProductPrice(
                      itemToDelete.product,
                      itemToDelete.variant_type
                    ) * itemToDelete.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
