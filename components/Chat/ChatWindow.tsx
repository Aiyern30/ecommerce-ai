"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button, Input } from "@/components/ui";
import { Maximize2, Minimize2, X, Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  isExpanded: boolean;
  onClose: () => void;
  onExpand: () => void;
}

export default function ChatWindow({
  isExpanded,
  onClose,
  onExpand,
}: ChatWindowProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set typing indicator when AI is generating a response
  useEffect(() => {
    setIsTyping(isLoading);
  }, [isLoading]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden flex flex-col border",
        "border-gray-300 dark:border-slate-700 transition-all duration-300 ease-in-out",
        isExpanded
          ? "fixed inset-4 z-50 md:inset-10"
          : "w-80 h-96 md:w-96 md:h-[32rem]"
      )}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">
          AI Assistant
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExpand}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isExpanded ? "Minimize" : "Maximize"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 dark:text-slate-400 text-center">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages
            .filter((message) => message.role !== "data")
            .map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form
        onSubmit={onFormSubmit}
        className="p-4 border-t dark:border-slate-700"
      >
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
