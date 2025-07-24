"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useState } from "react";
import WhatsAppChat from "./Chat/WhatsAppChat";
import ChatButton from "./Chat/ChatButton";
import { Toaster } from "./ui";
import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "./CartProvider";
import { AuthGuard } from "./AuthGuard";
import { usePathname } from "next/navigation";
import { WHATSAPP_CONFIG } from "@/lib/whatsapp/config";

interface LayoutProps {
  children: React.ReactNode;
}

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/profile",
  "/checkout",
  "/wishlist",
  "/notifications",
  "/order",
];

// Check if current path requires authentication
const requiresAuth = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
};

export function CustomerLayout({ children }: LayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();
  const needsAuth = requiresAuth(pathname);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const renderContent = () => (
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
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CartProvider>
        {needsAuth ? <AuthGuard>{renderContent()}</AuthGuard> : renderContent()}
      </CartProvider>
    </ThemeProvider>
  );
}
