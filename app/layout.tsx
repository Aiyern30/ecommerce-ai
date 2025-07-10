import "./globals.css";
import "./custom.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import { getMetadataForPath } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const path = headersList.get("x-pathname") || "/";
  const metadata = getMetadataForPath(path);

  // Ensure icons are always present
  return {
    ...metadata,
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
        { url: "/icon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
        { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
        { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
      ],
      apple: [
        {
          url: "/apple-touch-icon.svg",
          sizes: "180x180",
          type: "image/svg+xml",
        },
      ],
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="icon"
          href="/icon-32x32.svg"
          sizes="32x32"
          type="image/svg+xml"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.svg"
          sizes="180x180"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
