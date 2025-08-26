/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";

import {
  Send,
  X,
  User,
  Loader2,
  ShoppingCart,
  Package,
  Calculator,
  Info,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import {
  Card,
  Input,
  Badge,
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  CardContent,
} from "../ui";
import TypingIndicator from "./TypingIndicator";
import { Product } from "@/type/product";
import { toast } from "sonner";
import { addToCart, getProductPrice } from "@/lib/cart/utils";
import { useUser } from "@supabase/auth-helpers-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import type { CartItem } from "@/type/cart";
import Link from "next/link";
import { getFaqs } from "@/lib/faq/getFaqs";
import { getVariantDisplayName } from "@/lib/utils/format";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "product" | "error" | "cart" | "order";
  metadata?: {
    products?: Product[];
    suggestions?: string[];
    intent?: string;
    confidence?: number;
    extractedData?: any;
    isConstructionQuery?: boolean;
    cart?: CartItem[];
    orders?: any[];
  };
}

interface GeminiChatProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}

export default function GeminiChat({
  isOpen,
  onClose,
  businessName,
}: GeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hi! I'm your concrete specialist AI assistant for ${businessName}. I can help you find the right concrete grade for your project, provide pricing information, and assist with delivery options. We offer N-series grades (N10-N25) for residential projects and S-series grades (S30-S45) for structural work. What can I help you with today?`,
      sender: "bot",
      timestamp: new Date(),
      type: "text",
      metadata: {
        suggestions: [
          "Show me N-series concrete grades",
          "What's the difference between N20 and N25?",
          "Pricing for foundation concrete",
          "Pump delivery options",
        ],
      },
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [deliverySelections, setDeliverySelections] = useState<{
    [id: string]: string;
  }>({});
  const [qtyInputs, setQtyInputs] = useState<{ [id: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function stringSimilarity(a: string, b: string): number {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a === b) return 1;
    const aWords = a.split(/\s+/);
    const bWords = b.split(/\s+/);
    const common = aWords.filter((w) => bWords.includes(w));
    return common.length / Math.max(aWords.length, bWords.length);
  }

  async function findMatchingFaq(
    userQuestion: string
  ): Promise<{ question: string; answer: string } | null> {
    const faqs = await getFaqs();
    let bestMatch = null;
    let bestScore = 0.5;
    for (const faq of faqs) {
      const score = stringSimilarity(userQuestion, faq.question);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }
    return bestMatch
      ? { question: bestMatch.question, answer: bestMatch.answer }
      : null;
  }

  const sendMessage = async (message: string, { system = false } = {}) => {
    if (!message.trim() || isLoading) return;

    if (!system) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message.trim(),
        sender: "user",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, userMessage]);
    }
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // 1. Try FAQ match first
      const faqMatch = await findMatchingFaq(message.trim());
      if (faqMatch) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: faqMatch.answer,
          sender: "bot",
          timestamp: new Date(),
          type: "text",
          metadata: {
            suggestions: ["Ask another question", "Show all FAQs"],
          },
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
        setIsTyping(false);
        return;
      }

      // 2. Fallback to normal AI chat
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          conversationHistory: messages.slice(-5),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      if (data.cartUpdated) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: "bot",
        timestamp: new Date(),
        type: data.type || "text",
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or contact our sales team for immediate assistance.",
        sender: "bot",
        timestamp: new Date(),
        type: "error",
        metadata: {
          suggestions: [
            "Try asking about concrete grades",
            "Ask about pricing",
            "Contact sales team",
          ],
        },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case "price_inquiry":
        return <Calculator size={12} className="text-green-600" />;
      case "technical_question":
        return <Info size={12} className="text-purple-600" />;
      case "product_search":
        return <Package size={12} className="text-orange-600" />;
      default:
        return <RiRobot2Line size={12} className="text-gray-600" />;
    }
  };

  const handleDeliveryTypeChange = (
    productId: string,
    deliveryType: string
  ) => {
    setDeliverySelections((prev) => ({
      ...prev,
      [productId]: deliveryType,
    }));
  };

  const handleAddToCart = async (product: Product, deliveryType?: string) => {
    if (!user?.id) {
      toast.error("Please login to add items to cart", {
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/login"),
        },
      });
      return;
    }
    setAddingProductId(product.id);
    try {
      // Use pump delivery if available, otherwise normal
      const delivery =
        deliveryType ||
        deliverySelections[product.id] ||
        (product.pump_price ? "pump" : "normal");
      const result = await addToCart(user.id, product.id, 1, delivery);
      if (result.success) {
        toast.success("Added to cart!", {
          description: `${product.name} (${delivery}) has been added to your cart.`,
        });
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        toast.error("Failed to add item to cart", {
          description: "Please try again.",
        });
      }
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingProductId(null);
    }
  };

  const handleQtyInputChange = (itemId: string, value: string) => {
    setQtyInputs((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleQtyUpdate = (item: CartItem) => {
    const newQty = Number(qtyInputs[item.id] ?? item.quantity);
    if (!isNaN(newQty) && newQty > 0 && newQty !== item.quantity) {
      sendMessage(`update quantity of ${item.product?.name} to ${newQty}`);
    }
  };

  const handleQtyStep = (item: CartItem, step: number) => {
    const newQty = item.quantity + step;
    if (newQty < 1) {
      sendMessage(`remove ${item.product?.name} from carts`, { system: true });
    } else {
      sendMessage(`update quantity of ${item.product?.name} to ${newQty}`);
    }
  };

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);

  const handleRemoveClick = (item: CartItem) => {
    setItemToRemove(item);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      sendMessage(`remove ${itemToRemove.product?.name} from carts`, {
        system: true,
      });
      setRemoveDialogOpen(false);
      setItemToRemove(null);
    }
  };

  const renderMessage = (
    message: Message,
    qtyInputs: { [id: string]: string },
    handleQtyInputChange: (itemId: string, value: string) => void,
    handleQtyUpdate: (item: CartItem) => void,
    handleQtyStep: (item: CartItem, step: number) => void
  ) => {
    const isBot = message.sender === "bot";

    if (message.type === "cart" && message.metadata?.cart) {
      const cartItems = message.metadata.cart;

      return (
        <div className="mb-4">
          <div className="font-semibold mb-2">{message.content}</div>
          {cartItems.length === 0 ? (
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
            <div className="space-y-4">
              {cartItems.map((item: CartItem) => {
                const itemPrice = getProductPrice(
                  item.product,
                  item.variant_type
                );
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg transition-colors"
                  >
                    <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      <Image
                        src={
                          item.product?.product_images?.[0]?.image_url ||
                          item.product?.image_url ||
                          "/placeholder.svg"
                        }
                        alt={item.product?.name || "Product"}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1 line-clamp-2">
                        {item.product?.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Unit: {item.product?.unit || "per bag"}
                      </div>
                      <div className="text-xs text-blue-600 mb-1">
                        {getVariantDisplayName(item.variant_type)}
                      </div>
                      <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                        <span>Price:</span>
                        <span className="bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded">
                          RM{itemPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg px-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7"
                            onClick={() => handleQtyStep(item, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <input
                            type="number"
                            min={1}
                            value={qtyInputs[item.id] ?? item.quantity}
                            onChange={(e) =>
                              handleQtyInputChange(item.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleQtyUpdate(item);
                            }}
                            className="w-10 text-center text-sm font-medium bg-transparent outline-none"
                            style={{ appearance: "textfield" }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7"
                            onClick={() => handleQtyStep(item, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7"
                            onClick={() => handleQtyUpdate(item)}
                            aria-label="Update quantity"
                          >
                            ✓
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 border rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleRemoveClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        RM{(itemPrice * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (message.type === "order" && message.metadata?.orders) {
      const orders = message.metadata.orders;
      return (
        <div className="mb-4">
          <div className="font-semibold mb-2">{message.content}</div>
          {orders.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                  No orders yet
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't placed any orders yet. Start shopping to see your
                  orders here and track their progress.
                </p>
                <Link href="/products">
                  <Button size="lg" className="px-8">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Start Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {orders.map((order: any) => (
                <Card key={order.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">
                        Order #{order.order_number || order.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {order.status} | Payment: {order.payment_status}
                      </div>
                      <div className="text-xs text-gray-500">
                        Placed:{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs font-semibold mt-1">
                        <span className="text-gray-500">Total:</span>{" "}
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">
                          RM{order.total?.toFixed(2) ?? order.total}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/profile/orders/${order.id}`}
                      target="_blank"
                      className="ml-2"
                    >
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-2">
                      <div className="font-semibold text-xs mb-1">Items:</div>
                      <ul className="list-disc pl-4 text-xs">
                        {order.order_items.map((item: any) => (
                          <li key={item.id}>
                            {item.product?.name}
                            {item.product?.grade
                              ? ` (${item.product.grade})`
                              : ""}
                            {item.quantity ? ` x ${item.quantity}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}
      >
        <div
          className={`flex max-w-[85%] ${
            isBot ? "flex-row" : "flex-row-reverse"
          }`}
        >
          <div className={`flex-shrink-0 ${isBot ? "mr-2" : "ml-2"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isBot
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
              }`}
            >
              {isBot ? <RiRobot2Line size={16} /> : <User size={16} />}
            </div>
          </div>

          <div
            className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-full ${
                isBot
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "bg-blue-500 text-white"
              }`}
            >
              {isBot ? (
                <ReactMarkdown className="text-sm">
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {isBot &&
              message.metadata?.intent &&
              process.env.NODE_ENV === "development" && (
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  {getIntentIcon(message.metadata.intent)}
                  <span>{message.metadata.intent}</span>
                  {message.metadata.confidence && (
                    <span>
                      ({Math.round(message.metadata.confidence * 100)}%)
                    </span>
                  )}
                </div>
              )}

            {message.metadata?.products &&
              message.metadata.products.length > 0 && (
                <div className="mt-2 space-y-2 w-full">
                  {/* Filter out duplicate products by id */}
                  {Array.from(
                    new Map(
                      message.metadata.products.map((p) => [p.id, p])
                    ).values()
                  ).map((product: Product, idx: number) => {
                    const isRecommended =
                      message.metadata?.intent === "recommendation" &&
                      idx === 0;

                    const deliveryOptions = [
                      product.normal_price
                        ? {
                            key: "normal",
                            label: "Normal",
                            price: product.normal_price,
                          }
                        : null,
                      product.pump_price
                        ? {
                            key: "pump",
                            label: "Pump",
                            price: product.pump_price,
                          }
                        : null,
                      product.tremie_1_price
                        ? {
                            key: "tremie_1",
                            label: "Tremie 1",
                            price: product.tremie_1_price,
                          }
                        : null,
                      product.tremie_2_price
                        ? {
                            key: "tremie_2",
                            label: "Tremie 2",
                            price: product.tremie_2_price,
                          }
                        : null,
                      product.tremie_3_price
                        ? {
                            key: "tremie_3",
                            label: "Tremie 3",
                            price: product.tremie_3_price,
                          }
                        : null,
                    ].filter(
                      (
                        opt
                      ): opt is { key: string; label: string; price: number } =>
                        opt !== null
                    );

                    const selectedDeliveryType =
                      deliverySelections[product.id] ||
                      (product.pump_price ? "pump" : "normal");

                    return (
                      <Card
                        key={`${product.id}-${idx}`}
                        className="p-3 max-w-sm relative"
                      >
                        {isRecommended && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                            Recommended
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.product_images &&
                            product.product_images.length > 0 &&
                            product.product_images[0].image_url ? (
                              <Image
                                src={product.product_images[0].image_url}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            ) : (
                              <Package size={16} className="text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">
                                {product.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  product.grade.startsWith("N")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {product.grade}
                              </Badge>
                            </div>

                            {product.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {product.description}
                              </p>
                            )}

                            <div className="mt-2 space-y-1">
                              {deliveryOptions.map((opt) => (
                                <div
                                  key={opt.key}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-xs text-gray-500">
                                    {opt.label}:
                                  </span>
                                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                    RM{opt.price}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {deliveryOptions.length > 1 && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  Delivery:
                                </span>
                                <Select
                                  value={selectedDeliveryType}
                                  onValueChange={(val) =>
                                    handleDeliveryTypeChange(product.id, val)
                                  }
                                >
                                  <SelectTrigger className="w-28 h-8 px-2 py-1 text-xs">
                                    <SelectValue placeholder="Delivery type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deliveryOptions.map(
                                      (opt) =>
                                        opt != null && (
                                          <SelectItem
                                            key={opt.key}
                                            value={opt.key}
                                          >
                                            {opt.label}
                                          </SelectItem>
                                        )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Stock:
                              </span>
                              <span
                                className={`text-xs ${
                                  (product.stock_quantity || 0) > 50
                                    ? "text-green-600"
                                    : (product.stock_quantity || 0) > 10
                                    ? "text-orange-600"
                                    : "text-red-600"
                                }`}
                              >
                                {product.stock_quantity || 0} units
                              </span>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={isRecommended ? "default" : "outline"}
                            className="flex-shrink-0"
                            disabled={addingProductId === product.id}
                            onClick={() =>
                              handleAddToCart(
                                product,
                                deliverySelections[product.id] ||
                                  (product.pump_price ? "pump" : "normal")
                              )
                            }
                          >
                            <ShoppingCart size={12} className="mr-1" />
                            {addingProductId === product.id
                              ? "Adding..."
                              : "Add"}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

            <span className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getQuickActions = () => {
    const lastBotMsg = [...messages]
      .reverse()
      .find(
        (msg) =>
          msg.sender === "bot" &&
          Array.isArray(msg.metadata?.suggestions) &&
          msg.metadata.suggestions.length > 0
      );
    // Remove fallback hardcoded suggestions, just use what's in metadata
    return lastBotMsg?.metadata?.suggestions || [];
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-20 right-4 w-[420px] h-[650px] shadow-xl p-0 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <RiRobot2Line size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Concrete Specialist AI</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isTyping
                ? "Analyzing your query..."
                : "Ready to help with concrete solutions"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-blue-200"
          aria-label="Close AI Chat"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) =>
              renderMessage(
                msg,
                qtyInputs,
                handleQtyInputChange,
                handleQtyUpdate,
                handleQtyStep
              )
            )}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <RiRobot2Line size={16} className="text-blue-600" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              </div>
            )}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about concrete grades, pricing, delivery..."
            disabled={isLoading}
            className="flex-1 bg-white dark:bg-gray-800"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send size={16} />
          </Button>
        </form>

        <div className="mt-2 flex flex-wrap gap-1">
          {getQuickActions().map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your cart? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {itemToRemove && (
            <div className="flex gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                <Image
                  src={
                    itemToRemove.product?.product_images?.[0]?.image_url ||
                    itemToRemove.product?.image_url ||
                    "/placeholder.svg"
                  }
                  alt={itemToRemove.product?.name || "Product"}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">
                  {itemToRemove.product?.name}
                </div>
                <div className="text-xs text-blue-600 mb-1">
                  {itemToRemove.variant_type}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Quantity: {itemToRemove.quantity}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
