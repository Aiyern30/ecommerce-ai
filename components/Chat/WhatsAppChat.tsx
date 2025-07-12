"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WHATSAPP_CONFIG,
  createWhatsAppUrl,
  formatPhoneNumber,
} from "@/lib/whatsapp-config";
import TypingIndicator from "./TypingIndicator";

interface WhatsAppChatProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  businessName?: string;
}

export default function WhatsAppChat({
  isOpen,
  onClose,
  whatsappNumber = WHATSAPP_CONFIG.businessNumber,
  businessName = WHATSAPP_CONFIG.businessName,
}: WhatsAppChatProps) {
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: number, text: string, isUser: boolean, timestamp: Date}>>([]);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'name' | 'templates' | 'custom'>('welcome');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageTemplates = WHATSAPP_CONFIG.templates;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize welcome message when chat opens
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      addMessage(`Hi! 👋 Welcome to ${businessName}. I'm here to help you connect with our team via WhatsApp.`, false, 800);
      addMessage("What would you like to do today?", false, 1600);
      setTimeout(() => setCurrentStep('templates'), 2000);
    }
  }, [isOpen, businessName, chatMessages.length]);

  const addMessage = (text: string, isUser: boolean = false, delay: number = 0) => {
    if (delay > 0 && !isUser) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const newMessage = {
          id: Date.now(),
          text,
          isUser,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, newMessage]);
      }, delay);
    } else {
      const newMessage = {
        id: Date.now(),
        text,
        isUser,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    addMessage(template, true);
    
    addMessage("Great choice! You can modify this message if needed, or click the green WhatsApp button to send it.", false, 1200);
    setCurrentStep('custom');
  };

  const handleCustomMessage = () => {
    if (message.trim() && !isProcessing) {
      addMessage(message, true);
      setSelectedTemplate(message);
      setMessage(""); // Clear the message input
      addMessage("Perfect! Click the green WhatsApp button to open the conversation.", false, 800);
    }
  };

  const handleSendWhatsApp = () => {
    if (isProcessing) return; // Prevent multiple calls
    
    setIsProcessing(true);
    const finalMessage = customerName
      ? `Hi, I'm ${customerName}. ${selectedTemplate || message}`
      : selectedTemplate || message;

    const whatsappUrl = createWhatsAppUrl(whatsappNumber, finalMessage);

    // Add final message only if not already processing
    if (!chatMessages.some(msg => msg.text.includes("Opening WhatsApp now"))) {
      addMessage("Opening WhatsApp now... 📱", false, 1000);
    }

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      
      // Small delay before closing to show the final message
      setTimeout(() => {
        onClose();
        
        // Reset state
        setMessage("");
        setCustomerName("");
        setSelectedTemplate("");
        setChatMessages([]);
        setCurrentStep('welcome');
        setIsTyping(false);
        setIsProcessing(false);
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 h-96 md:w-96 md:h-[32rem]",
        "bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden",
        "border border-gray-200 dark:border-slate-700",
        "transform transition-all duration-300 ease-out",
        isOpen 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-4 opacity-0 scale-95 pointer-events-none"
      )}
    >
      {/* WhatsApp-style Header */}
      <div className="flex items-center justify-between p-4 bg-green-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{businessName}</h3>
            <p className="text-xs text-green-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full"></span>
              Usually replies instantly
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-800 max-h-64 whatsapp-chat-scroll">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full whatsapp-message-enter",
              msg.isUser ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
                msg.isUser
                  ? "bg-green-500 text-white rounded-br-sm"
                  : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm border"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className={cn(
                "text-xs mt-1 opacity-70",
                msg.isUser ? "text-green-100" : "text-slate-500 dark:text-slate-400"
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons */}
      {currentStep === 'templates' && (
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto overflow-x-hidden">
            {messageTemplates.slice(0, 4).map((template, index) => (
              <button
                key={index}
                onClick={() => handleTemplateSelect(template)}
                className={cn(
                  "w-full text-left p-3 text-sm rounded-lg border transition-all duration-200",
                  "hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20",
                  "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800",
                  "hover:shadow-md transform-gpu min-h-[48px] flex items-center",
                  "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                )}
              >
                <span className="text-slate-700 dark:text-slate-300 line-clamp-2 break-words">
                  {template}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        {currentStep !== 'welcome' && (
          <div className="mb-3">
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name (optional)"
              className="text-sm"
            />
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={selectedTemplate || message}
              onChange={(e) => {
                if (selectedTemplate) {
                  setSelectedTemplate(e.target.value);
                } else {
                  setMessage(e.target.value);
                }
              }}
              placeholder={selectedTemplate ? "Edit your message or keep as is..." : "Type your message..."}
              className="min-h-[60px] text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if ((selectedTemplate || message).trim()) {
                    handleSendWhatsApp();
                  }
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            {message.trim() && !selectedTemplate && (
              <Button
                onClick={handleCustomMessage}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                title="Send custom message"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={handleSendWhatsApp}
              disabled={(!selectedTemplate && !message.trim()) || isProcessing}
              size="icon"
              className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              title="Open WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* WhatsApp Info */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Chat with {formatPhoneNumber(whatsappNumber)} • {WHATSAPP_CONFIG.responseTime}
          </p>
        </div>
      </div>
    </div>
  );
}
