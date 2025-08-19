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
} from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Card, Input, Badge, Button } from "../ui";
import TypingIndicator from "./TypingIndicator";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "product" | "error";
  metadata?: {
    products?: Product[];
    suggestions?: string[];
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
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
      content: `Hi! I'm your AI shopping assistant for ${businessName}. I can help you find products, answer questions about our inventory, and provide personalized recommendations. What are you looking for today?`,
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
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
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
        type: "error",
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

  const renderMessage = (message: Message) => {
    const isBot = message.sender === "bot";

    return (
      <div
        key={message.id}
        className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}
      >
        <div
          className={`flex max-w-[80%] ${
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
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* Product Cards */}
            {message.metadata?.products &&
              message.metadata.products.length > 0 && (
                <div className="mt-2 space-y-2 w-full">
                  {message.metadata.products.map((product) => (
                    <Card key={product.id} className="p-3 max-w-xs">
                      <div className="flex items-start gap-3">
                        {product.image && (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${product.price}
                          </p>
                          {product.category && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0"
                        >
                          <ShoppingCart size={12} className="mr-1" />
                          Add
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

            {/* Suggestions */}
            {message.metadata?.suggestions &&
              message.metadata.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.metadata.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
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
    <Card className="fixed bottom-20 right-4 w-96 h-[600px] shadow-xl p-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-50 dark:bg-blue-950 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Shopping Assistant</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
        {/* Add close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
          aria-label="Close AI Chat"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
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
          {/* Show TypingIndicator when bot is typing */}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about our products..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </Card>
  );
}
