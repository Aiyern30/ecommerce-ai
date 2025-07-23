"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useState } from "react";
import WhatsAppChat from "./Chat/WhatsAppChat";
import ChatButton from "./Chat/ChatButton";
import { Toaster } from "./ui";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "./CartProvider";
import { WHATSAPP_CONFIG } from "@/lib/whatsapp-config";

interface LayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: LayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-[70px]">
              {children}
              <Toaster richColors />
            </main>
            <div className="fixed bottom-0 right-0 z-50 flex items-end p-4">
              <WhatsAppChat
                isOpen={isChatOpen}
                onClose={closeChat}
                whatsappNumber={WHATSAPP_CONFIG.businessNumber}
                businessName={WHATSAPP_CONFIG.businessName}
              />
              {!isChatOpen && <ChatButton onClick={toggleChat} />}
            </div>
            <Footer />
          </div>
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
