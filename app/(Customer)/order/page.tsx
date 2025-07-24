"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "@/lib/stripe";
import PaymentForm from "@/components/PaymentForm";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { PaymentIntent } from "@stripe/stripe-js";
import { CreateOrderRequest } from "@/type/order";
import { useUser } from "@supabase/auth-helpers-react";
import { CartItem } from "@/type/cart";
import { getSelectedCartItems, clearSelectedCartItems } from "@/lib/cart-utils";

export default function OrderPage() {
  const router = useRouter();
  const user = useUser();
  const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState<
    "review" | "payment" | "success"
  >("review");
  const [shippingInfo, setShippingInfo] = useState({
    first_name: "",
    last_name: "",
    email: user?.email || "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  // Load selected items from database
  useEffect(() => {
    const loadSelectedItems = async () => {
      console.log("Order page - user state:", user); // Debug log

      // Wait for user to be loaded
      if (user === undefined) {
        console.log("User still loading..."); // Debug log
        return;
      }

      // If no user, just show empty state (don't redirect)
      if (!user?.id) {
        console.log("No user found, showing empty state"); // Debug log
        setSelectedCartItems([]);
        setIsLoading(false);
        return;
      }

      console.log("Loading selected items for user:", user.id); // Debug log

      try {
        const selectedItems = await getSelectedCartItems(user.id);
        console.log("Selected items loaded:", selectedItems); // Debug log

        setSelectedCartItems(selectedItems);
      } catch (error) {
        console.error("Error loading selected items:", error);
        toast.error("Failed to load selected items");
        setSelectedCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedItems();
  }, [user, router]);

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setShippingInfo((prev) => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  const calculateTotals = () => {
    const subtotal = selectedCartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    const shipping = 15.0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  const handleCreateOrder = async () => {
    if (selectedCartItems.length === 0) {
      toast.error("No items selected for order");
      return;
    }

    // Basic validation
    if (
      !shippingInfo.first_name ||
      !shippingInfo.last_name ||
      !shippingInfo.email ||
      !shippingInfo.address_line_1
    ) {
      toast.error("Please fill in all required shipping information");
      return;
    }

    setIsCreatingOrder(true);

    try {
      const orderRequest: CreateOrderRequest & { user_id: string } = {
        user_id: user?.id || "temp-user-id", // Use actual user ID
        items: selectedCartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || 0,
          // variant_type: item.variant_type, // Remove this if not in CartItem type
        })),
        shipping_address: shippingInfo,
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      const data = await response.json();
      console.log("API response:", { status: response.status, data }); // Debug log

      if (!response.ok) {
        console.error("Order creation failed:", data); // Debug log
        throw new Error(data.error || "Failed to create order");
      }

      // Validate that we got the required fields
      if (!data.client_secret || !data.order_id) {
        console.error("Missing required fields in response:", data); // Debug log
        throw new Error("Invalid response from server - missing payment data");
      }

      console.log("Order created successfully:", data); // Debug log
      setClientSecret(data.client_secret);
      setOrderId(data.order_id);
      setOrderAmount(data.amount);
      setPaymentStep("payment");
      toast.success("Order created successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: PaymentIntent) => {
    try {
      // Confirm payment status
      const response = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
        }),
      });

      if (response.ok) {
        // Clear selected cart items after successful payment
        if (user?.id) {
          await clearSelectedCartItems(user.id);
        }

        setPaymentStep("success");
        toast.success("Payment successful! Order confirmed.");
      } else {
        throw new Error("Failed to confirm payment");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(
        "Payment successful but confirmation failed. Please contact support."
      );
      // Still show success since payment went through
      setPaymentStep("success");
    }
  };

  const stripePromise = getStripe();

  // Show loading only while auth is being determined
  if (user === undefined || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading order page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-4">
                Thank you for your order. You will receive a confirmation email
                shortly.
              </p>
              <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/profile/orders")}
                  className="w-full"
                >
                  View Order History
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Complete Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Review / Shipping Info */}
          <div className="space-y-6">
            {paymentStep === "review" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name *"
                        className="w-full p-3 border rounded-lg"
                        value={shippingInfo.first_name}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            first_name: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Last Name *"
                        className="w-full p-3 border rounded-lg"
                        value={shippingInfo.last_name}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email *"
                      className="w-full p-3 border rounded-lg"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          email: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Phone *"
                      className="w-full p-3 border rounded-lg"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          phone: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1 *"
                      className="w-full p-3 border rounded-lg"
                      value={shippingInfo.address_line_1}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          address_line_1: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      className="w-full p-3 border rounded-lg"
                      value={shippingInfo.address_line_2}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          address_line_2: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City *"
                        className="w-full p-3 border rounded-lg"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            city: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        className="w-full p-3 border rounded-lg"
                        value={shippingInfo.state}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            state: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code *"
                        className="w-full p-3 border rounded-lg"
                        value={shippingInfo.postal_code}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            postal_code: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCartItems.length === 0 ? (
                      <p className="text-gray-500">No items selected</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedCartItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 border rounded"
                          >
                            <div>
                              <h4 className="font-medium">
                                {item.product?.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Unit: {item.product?.unit || "Piece"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                RM
                                {(
                                  (item.product?.price || 0) * item.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {paymentStep === "payment" && clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      orderId={orderId}
                      amount={orderAmount}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>RM{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>RM{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>RM{tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>RM{total.toFixed(2)}</span>
                </div>

                {paymentStep === "review" && (
                  <Button
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || selectedCartItems.length === 0}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {isCreatingOrder
                      ? "Creating Order..."
                      : "Proceed to Payment"}
                  </Button>
                )}

                {paymentStep === "payment" && (
                  <Button
                    variant="outline"
                    onClick={() => setPaymentStep("review")}
                    className="w-full mt-6"
                  >
                    Back to Review
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
