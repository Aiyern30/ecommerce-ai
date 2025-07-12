"use client";

import { Button } from "@/components/ui";
import { MessageCircle, Phone } from "lucide-react";
import { createWhatsAppUrl, WHATSAPP_CONFIG } from "@/lib/whatsapp-config";

interface WhatsAppInquiryProps {
  productName?: string;
  productId?: string;
  inquiryType?: "quote" | "info" | "support" | "general";
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export default function WhatsAppInquiry({
  productName,
  productId,
  inquiryType = "general",
  className = "",
  variant = "default",
  size = "default",
}: WhatsAppInquiryProps) {
  const generateMessage = () => {
    const baseMessages = {
      quote: "I need a quote for",
      info: "I'd like more information about",
      support: "I need support regarding",
      general: "I'm interested in",
    };

    let message = baseMessages[inquiryType];

    if (productName) {
      message += ` ${productName}`;
      if (productId) {
        message += ` (Product ID: ${productId})`;
      }
    } else {
      message += " your products";
    }

    message += ". Could you please help me?";

    return message;
  };

  const handleWhatsAppClick = () => {
    const message = generateMessage();
    const whatsappUrl = createWhatsAppUrl(
      WHATSAPP_CONFIG.businessNumber,
      message
    );
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      variant={variant}
      size={size}
      className={`${className} bg-green-600 hover:bg-green-700 text-white`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      WhatsApp Inquiry
    </Button>
  );
}

// Alternative component for phone calls
export function WhatsAppCall({
  className = "",
  phoneNumber = WHATSAPP_CONFIG.businessNumber,
}: {
  className?: string;
  phoneNumber?: string;
}) {
  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, "_self");
  };

  return (
    <Button
      onClick={handleCall}
      variant="outline"
      size="default"
      className={className}
    >
      <Phone className="h-4 w-4 mr-2" />
      Call Us
    </Button>
  );
}
