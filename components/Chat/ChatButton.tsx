"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/";
import { WHATSAPP_CONFIG, createWhatsAppUrl } from "@/lib/whatsapp-config";

interface ChatButtonProps {
  onClick?: () => void;
  whatsappNumber?: string;
  defaultMessage?: string;
}

export default function ChatButton({
  onClick,
  whatsappNumber = WHATSAPP_CONFIG.businessNumber,
  defaultMessage = WHATSAPP_CONFIG.defaultMessages.general,
}: ChatButtonProps) {
  const handleWhatsAppClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // Create WhatsApp URL using helper function
    const whatsappUrl = createWhatsAppUrl(whatsappNumber, defaultMessage);

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size="icon"
      className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 transition-all duration-300 animate-fade-in"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Chat on WhatsApp</span>
    </Button>
  );
}
