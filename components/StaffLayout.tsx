"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "./ui";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: LayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pt-[70px]">
            {children}
            <Toaster />
          </main>

          <Footer />
        </div>
      </SessionProvider>
    </ThemeProvider>
  );
}
