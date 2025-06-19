// app/layout.tsx or app/RootLayout.tsx (Server Component)
import "./globals.css";
import "./custom.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Layout } from "@/components/Layout";
import { SupabaseProvider } from "@/components/SupabaseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopYTL",
  description:
    "Your go-to destination for quality products and seamless shopping",
  icons: [{ rel: "icon", type: "image/png", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <Layout>{children}</Layout>
        </SupabaseProvider>
      </body>
    </html>
  );
}
