"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/cart/calculations";
import { getProductPrice } from "@/lib/cart/utils";
import Image from "next/image";

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

interface CheckoutSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  checkoutButtonText?: string;
  checkoutButtonDisabled?: boolean;
  selectedServices?: { [key: string]: boolean };
  totalVolume?: number;
  additionalServices?: AdditionalService[];
  freightCharges?: FreightCharge[];
}

export function CheckoutSummary({
  showCheckoutButton = false,
  onCheckout,
  checkoutButtonText = "Proceed to Checkout",
  checkoutButtonDisabled = false,
  selectedServices = {},
  totalVolume = 0,
  additionalServices = [],
  freightCharges = [],
}: CheckoutSummaryProps) {
  const { cartItems, isLoading } = useCart();
  const selectedItems = cartItems.filter((item) => item.selected);

  // Calculate subtotal from selected items
  const subtotal = selectedItems.reduce((sum, item) => {
    const itemPrice = getProductPrice(item.product, item.variant_type);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Calculate additional services total
  const servicesTotal = additionalServices.reduce((sum, service) => {
    if (selectedServices[service.service_code]) {
      return sum + service.rate_per_m3 * totalVolume;
    }
    return sum;
  }, 0);

  // Get applicable freight charge
  const getApplicableFreightCharge = (): FreightCharge | null => {
    if (totalVolume === 0) return null;

    return (
      freightCharges.find((charge) => {
        const minVol = charge.min_volume;
        const maxVol = charge.max_volume;

        if (maxVol === null) {
          return totalVolume >= minVol;
        } else {
          return totalVolume >= minVol && totalVolume <= maxVol;
        }
      }) || null
    );
  };

  const applicableFreightCharge = getApplicableFreightCharge();
  const freightCost = applicableFreightCharge
    ? applicableFreightCharge.delivery_fee
    : 0;

  // Calculate tax (SST 6%) on subtotal + services + freight
  const taxableAmount = subtotal + servicesTotal + freightCost;
  const tax = taxableAmount * 0.06;

  // Calculate total
  const total = taxableAmount + tax;

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-sm py-0 gap-0">
        <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <Card className="overflow-hidden shadow-sm py-0 gap-0">
        <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No items selected</p>
          </div>
          {showCheckoutButton && (
            <div className="mt-6">
              <Button className="w-full" disabled={true} size="lg">
                Select items to checkout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm py-0 gap-0">
      <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Selected Items */}
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex gap-3 py-2">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={item.product?.image_url || "/placeholder.svg"}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-1">
                    {item.product?.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      @{" "}
                      {formatCurrency(
                        getProductPrice(item.product, item.variant_type)
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {formatCurrency(
                      getProductPrice(item.product, item.variant_type) *
                        item.quantity
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Summary Calculations */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal ({selectedItems.length} items, {totalVolume.toFixed(2)}{" "}
                m³)
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Additional Services */}
            {servicesTotal > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Additional Services:
                </div>
                {additionalServices.map((service) => {
                  if (!selectedServices[service.service_code]) return null;
                  const serviceTotal = service.rate_per_m3 * totalVolume;
                  return (
                    <div
                      key={service.id}
                      className="flex justify-between items-center text-sm pl-4"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {service.service_name}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(serviceTotal)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Services Total
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(servicesTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Freight Charges */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Delivery Fee
                {applicableFreightCharge && (
                  <span className="text-xs block text-gray-500">
                    ({applicableFreightCharge.description})
                  </span>
                )}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(freightCost)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax (SST 6%)
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(tax)}
              </span>
            </div>

            {/* Free shipping message */}
            {freightCost === 0 && totalVolume >= 4.5 && (
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                🎉 Free delivery for orders 4.5m³ and above!
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          {showCheckoutButton && (
            <div className="mt-8">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                size="lg"
                disabled={checkoutButtonDisabled || selectedItems.length === 0}
                onClick={onCheckout}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{checkoutButtonText}</span>
                  {selectedItems.length > 0 && (
                    <>
                      <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm font-bold">
                        {selectedItems.length}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </div>
              </Button>
            </div>
          )}

          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Secure checkout guaranteed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
