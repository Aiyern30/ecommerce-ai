"use client";

import { Button } from "@/components/ui";
import { CheckCircle, Package, Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  // Mock order ID - in real app this would come from the order creation
  const orderId =
    "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Thank you for your order. We&apos;ve received your payment and will
            process your order shortly.
          </p>

          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-8">
            Order ID: <span className="text-blue-600">{orderId}</span>
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">What&apos;s Next?</h3>

            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <Receipt className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You&apos;ll receive an email confirmation within 5 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <p className="font-medium">Processing & Shipping</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your order will be processed within 1-2 business days
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Estimated delivery: 3-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile/orders">
              <Button variant="outline" className="w-full sm:w-auto">
                Track Your Order
              </Button>
            </Link>

            <Link href="/products">
              <Button className="w-full sm:w-auto">
                Continue Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Questions about your order? Contact us at{" "}
              <a
                href="mailto:support@cementproducts.com"
                className="text-blue-600 hover:underline"
              >
                support@cementproducts.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
