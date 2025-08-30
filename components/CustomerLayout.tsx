"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useEffect, useState } from "react";
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkDevice = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkDevice();
      window.addEventListener("resize", checkDevice);
      return () => window.removeEventListener("resize", checkDevice);
    }, []);

    // Prevent scroll when chat is open on mobile
    useEffect(() => {
      if (isMobile && isChatOpen) {
        // Save current scroll position
        const scrollY = window.scrollY;

        // Apply styles to prevent scrolling
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        return () => {
          // Restore scroll position and remove styles
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          document.body.style.overflow = "";
          window.scrollTo(0, scrollY);
        };
      }
    }, [isMobile, isChatOpen]);

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-[140px] sm:pt-[120px]">
          {children}
          <Toaster richColors />
        </main>
        <div
          className={`fixed z-50 flex items-end ${
            isMobile ? "bottom-4 right-4" : "bottom-0 right-0 p-4"
          }`}
        >
          {/* Floating button toggles GeminiChat open/close */}
          <button
            onClick={toggleChat}
            className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
              isMobile ? "w-14 h-14" : "w-16 h-16"
            } ${
              isChatOpen && isMobile
                ? "scale-0 opacity-0"
                : "scale-100 opacity-100"
            }`}
            aria-label={isChatOpen ? "Close AI Chat" : "Open AI Chat"}
          >
            {isChatOpen ? (
              <X className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`} />
            ) : (
              <MessageCircle
                className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
              />
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
