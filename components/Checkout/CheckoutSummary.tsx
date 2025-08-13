"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ShoppingCart, ArrowRight, CheckCircle, Info } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/cart/calculations";
import { getProductPrice } from "@/lib/cart/utils";
import Image from "next/image";
import { SelectedServiceDetails } from "@/app/(customer)/cart/page";

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

// Update your CheckoutSummary component props interface
interface CheckoutSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  checkoutButtonText?: string;
  checkoutButtonDisabled?: boolean;
  selectedServices: { [serviceCode: string]: SelectedServiceDetails | null };
  totalVolume: number;
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

  // Get selected services for display
  const selectedServicesList = additionalServices.filter(
    (service) => selectedServices[service.service_code]
  );

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
    <Card className="overflow-hidden shadow-lg border-2 border-gray-100 dark:border-gray-700">
      <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} •{" "}
          {totalVolume.toFixed(2)} m³ total
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Selected Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
              Selected Products
            </h4>
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 py-2 border-l-2 border-blue-200 dark:border-blue-700 pl-3"
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={item.product?.image_url || "/placeholder.svg"}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-1 text-gray-900 dark:text-gray-100">
                    {item.product?.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300 font-medium">
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

          {/* Selected Additional Services */}
          {selectedServicesList.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Additional Services
              </h4>
              {selectedServicesList.map((service) => {
                const serviceTotal = service.rate_per_m3 * totalVolume;
                return (
                  <div
                    key={service.id}
                    className="flex gap-3 py-2 border-l-2 border-green-200 dark:border-green-700 pl-3 bg-green-50/50 dark:bg-green-900/10 rounded-r-lg"
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {service.service_name}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 dark:bg-green-800 px-2 py-0.5 rounded text-green-700 dark:text-green-300 font-medium">
                          RM{service.rate_per_m3.toFixed(2)}/m³
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          × {totalVolume.toFixed(2)} m³
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-700 dark:text-green-300 text-sm">
                        {formatCurrency(serviceTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 my-6"></div>

          {/* Summary Calculations */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Products Subtotal
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Additional Services Total */}
            {servicesTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Services Total
                </span>
                <span className="font-medium text-green-700 dark:text-green-300">
                  {formatCurrency(servicesTotal)}
                </span>
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
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                🎉 Free delivery for orders 4.5m³ and above!
              </div>
            )}

            {/* Services benefit message */}
            {selectedServicesList.length > 0 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {selectedServicesList.length} additional service
                {selectedServicesList.length !== 1 ? "s" : ""} added to enhance
                your concrete
              </div>
            )}

            <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(total)}
                </span>
              </div>
              {(servicesTotal > 0 || freightCost === 0) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {servicesTotal > 0 &&
                    `Includes RM${servicesTotal.toFixed(2)} in services`}
                  {servicesTotal > 0 && freightCost === 0 && " • "}
                  {freightCost === 0 &&
                    totalVolume >= 4.5 &&
                    "Free delivery included"}
                </div>
              )}
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

              {/* Checkout Summary */}
              <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                {selectedItems.length} product
                {selectedItems.length !== 1 ? "s" : ""}
                {selectedServicesList.length > 0 &&
                  ` + ${selectedServicesList.length} service${
                    selectedServicesList.length !== 1 ? "s" : ""
                  }`}
                {" • "}Total: {formatCurrency(total)}
              </div>
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
