"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useEffect } from "react";
import { Toaster } from "./ui";
import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "./CartProvider";
import { AuthGuard } from "./AuthGuard";
import { usePathname, useRouter } from "next/navigation";
import { WHATSAPP_CONFIG } from "@/lib/whatsapp/config";
import GeminiChat from "./Chat/GeminiChat";
import { MessageCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { ChatProvider, useChat } from "./ChatContext";
import { WishlistProvider } from "./WishlistProvider";

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
  const pathname = usePathname();
  const router = useRouter();
  const needsAuth = requiresAuth(pathname ?? "");

  useEffect(() => {
    const checkBan = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (
        user?.user_metadata?.banned_at ||
        user?.app_metadata?.ban_info?.banned_at
      ) {
        const reason =
          user?.app_metadata?.ban_info?.reason ||
          user?.user_metadata?.ban_reason ||
          "No reason provided";
        const bannedByName = user?.app_metadata?.ban_info?.banned_by_name || "";
        const bannedByEmail =
          user?.app_metadata?.ban_info?.banned_by_email || "";
        const bannedUntil = user?.app_metadata?.ban_info?.banned_until || "";
        router.replace(
          `/403?banned=1` +
            `&reason=${encodeURIComponent(reason)}` +
            `&banned_by_name=${encodeURIComponent(bannedByName)}` +
            `&banned_by_email=${encodeURIComponent(bannedByEmail)}` +
            `&banned_until=${encodeURIComponent(bannedUntil)}`
        );
      }
    };
    checkBan();
  }, [router]);

  // Replace renderContent function with a component
  function RenderContent() {
    const { isChatOpen, toggleChat, closeChat } = useChat();

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-[140px] sm:pt-[120px]">
          {children}
          <Toaster richColors />
        </main>
        <div className="fixed bottom-0 right-0 z-50 flex items-end p-4">
          {/* Floating button toggles GeminiChat open/close */}
          <button
            onClick={toggleChat}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center"
            aria-label={isChatOpen ? "Close AI Chat" : "Open AI Chat"}
          >
            {isChatOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </button>
          <GeminiChat
            isOpen={isChatOpen}
            onClose={closeChat}
            businessName={WHATSAPP_CONFIG.businessName}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CartProvider>
        <WishlistProvider>
          <ChatProvider>
            {needsAuth ? (
              <AuthGuard>
                <RenderContent />
              </AuthGuard>
            ) : (
              <RenderContent />
            )}
          </ChatProvider>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
