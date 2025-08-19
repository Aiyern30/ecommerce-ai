/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Bot,
  User,
  Loader2,
  ShoppingCart,
  Package,
  Calculator,
  Info,
} from "lucide-react";
import { Card, Input, Badge, Button } from "../ui";
import TypingIndicator from "./TypingIndicator";
import { Product } from "@/type/product";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart/utils"; // adjust import if needed
import { useUser } from "@supabase/auth-helpers-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "product" | "error";
  metadata?: {
    products?: Product[];
    suggestions?: string[];
    intent?: string;
    confidence?: number;
    extractedData?: any;
    isConstructionQuery?: boolean;
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

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat/gemini", {
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

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: "bot",
        timestamp: new Date(),
        type: data.type || "text",
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
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
        return <Bot size={12} className="text-gray-600" />;
    }
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
      const delivery = deliveryType || (product.pump_price ? "pump" : "normal");
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

  const renderMessage = (message: Message) => {
    const isBot = message.sender === "bot";

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
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isBot ? "mr-2" : "ml-2"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isBot
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
              }`}
            >
              {isBot ? <Bot size={16} /> : <User size={16} />}
            </div>
          </div>

          {/* Message Content */}
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

            {/* Intent Indicator for Development/Debugging */}
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

            {/* Enhanced Product Cards */}
            {message.metadata?.products &&
              message.metadata.products.length > 0 && (
                <div className="mt-2 space-y-2 w-full">
                  {message.metadata.products.map(
                    (product: Product, idx: number) => {
                      // Example: Mark first product as recommended if intent is 'recommendation'
                      const isRecommended =
                        message.metadata?.intent === "recommendation" &&
                        idx === 0;

                      return (
                        <Card
                          key={product.id}
                          className="p-3 max-w-sm relative"
                        >
                          {/* Recommended badge */}
                          {isRecommended && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                              Recommended
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-md flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-gray-600" />
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

                              {/* Price Display */}
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    Normal:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {product.normal_price
                                      ? `RM${product.normal_price}`
                                      : "N/A"}
                                  </span>
                                </div>
                                {product.pump_price && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      Pump:
                                    </span>
                                    <span className="text-sm font-medium">
                                      RM{product.pump_price}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Stock Status */}
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
                                  product.pump_price ? "pump" : "normal"
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
                    }
                  )}
                </div>
              )}

            {/* Enhanced Suggestions */}
            {message.metadata?.suggestions &&
              message.metadata.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.metadata.suggestions.map(
                    (suggestion: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs hover:bg-blue-50"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    )
                  )}
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

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-20 right-4 w-[420px] h-[650px] shadow-xl p-0 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
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

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-blue-600" />
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

      {/* Input */}
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

        {/* Quick Actions */}
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            onClick={() => handleSuggestionClick("Show me N20 concrete")}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            N20 Grade
          </button>
          <button
            onClick={() => handleSuggestionClick("Compare delivery methods")}
            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            Delivery Options
          </button>
          <button
            onClick={() => handleSuggestionClick("Foundation concrete pricing")}
            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            Pricing
          </button>
        </div>
      </div>
    </Card>
  );
}
