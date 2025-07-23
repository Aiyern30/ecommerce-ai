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

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_type?: string;
  image_url?: string;
}

interface OrderPageProps {
  initialCartItems?: CartItem[];
}

export default function OrderPage({ initialCartItems = [] }: OrderPageProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "review" | "payment" | "success"
  >("review");
  const [shippingInfo, setShippingInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  // Load cart items from localStorage on component mount
  useEffect(() => {
    if (initialCartItems.length === 0) {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error);
        }
      }
    }
  }, [initialCartItems.length]);

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 15.0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
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
        user_id: "temp-user-id", // You should get this from auth context
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          variant_type: item.variant_type,
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

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
        setPaymentStep("success");
        // Clear cart
        localStorage.removeItem("cart");
        setCartItems([]);
        toast.success("Payment successful! Order confirmed.");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(
        "Payment successful but confirmation failed. Please contact support."
      );
    }
  };

  const stripePromise = getStripe();

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
                    {cartItems.length === 0 ? (
                      <p className="text-gray-500">No items in cart</p>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 border rounded"
                          >
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              {item.variant_type && (
                                <p className="text-sm text-gray-500">
                                  Variant: {item.variant_type}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {paymentStep === "review" && (
                  <Button
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || cartItems.length === 0}
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
