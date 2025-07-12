"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WHATSAPP_CONFIG,
  createWhatsAppUrl,
  formatPhoneNumber,
} from "@/lib/whatsapp-config";

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

  const messageTemplates = WHATSAPP_CONFIG.templates;

  const handleSendWhatsApp = () => {
    const finalMessage = customerName
      ? `Hi, I'm ${customerName}. ${message || selectedTemplate}`
      : message || selectedTemplate;

    const whatsappUrl = createWhatsAppUrl(whatsappNumber, finalMessage);

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    // Close the modal
    onClose();

    // Reset form
    setMessage("");
    setCustomerName("");
    setSelectedTemplate("");
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setMessage(template);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={cn(
          "bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden flex flex-col border",
          "border-gray-300 dark:border-slate-700 w-full max-w-md mx-4"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 bg-green-600 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <div>
              <h2 className="font-semibold">Chat with {businessName}</h2>
              <p className="text-sm text-green-100">
                We&apos;ll respond on WhatsApp
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white hover:bg-green-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Customer Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Your Name (Optional)
            </label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full"
            />
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Quick Messages
            </label>
            <div className="space-y-2">
              {messageTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    "hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20",
                    selectedTemplate === template
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
                      : "border-gray-200 dark:border-slate-600"
                  )}
                >
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {template}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Custom Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full min-h-[100px]"
            />
          </div>

          {/* WhatsApp Number Display */}
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You&apos;ll be redirected to WhatsApp to chat with:
            </p>
            <p className="font-medium text-green-600 dark:text-green-400">
              {formatPhoneNumber(whatsappNumber)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {WHATSAPP_CONFIG.responseTime}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-slate-700">
          <Button
            onClick={handleSendWhatsApp}
            disabled={!message.trim() && !selectedTemplate}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Open WhatsApp Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
