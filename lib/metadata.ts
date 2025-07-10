import type { Metadata } from "next";

// Base metadata configuration with unified favicon
const baseMetadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/icon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  themeColor: "#3B82F6",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  authors: [{ name: "ShopYTL" }],
  creator: "ShopYTL",
  publisher: "ShopYTL",
  category: "ecommerce",
  keywords: ["ecommerce", "building materials", "construction", "YTL", "shop"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ShopYTL",
    images: [
      {
        url: "/icon-512x512.svg",
        width: 512,
        height: 512,
        alt: "ShopYTL Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    creator: "@ShopYTL",
    images: ["/icon-512x512.svg"],
  },
};

export function getMetadataForPath(path: string): Metadata {
  // Staff section
  if (path.startsWith("/staff/dashboard")) {
    return {
      ...baseMetadata,
      title: "Staff Dashboard - ShopYTL",
      description: "Overview and key metrics for internal operations.",
    };
  }

  if (path.startsWith("/staff/products")) {
    return {
      ...baseMetadata,
      title: "Staff Products Management - ShopYTL",
      description: "Manage and update products available in the store.",
    };
  }

  if (path.startsWith("/staff/orders")) {
    return {
      ...baseMetadata,
      title: "Staff Orders - ShopYTL",
      description: "View and process customer orders efficiently.",
    };
  }

  if (path.startsWith("/staff/posts")) {
    return {
      ...baseMetadata,
      title: "Staff Posts - ShopYTL",
      description: "Manage blog posts, news, and company announcements.",
    };
  }

  if (path.startsWith("/staff")) {
    return {
      ...baseMetadata,
      title: "Staff Panel - ShopYTL",
      description: "Internal tools for managing ShopYTL.",
    };
  }

  // Customer pages
  if (path.startsWith("/products")) {
    return {
      ...baseMetadata,
      title: "Our Products - ShopYTL",
      description: "Browse our latest building materials and products.",
    };
  }

  if (path.startsWith("/cart")) {
    return {
      ...baseMetadata,
      title: "Your Shopping Cart - ShopYTL",
      description: "Review and manage items in your cart before checkout.",
    };
  }

  if (path.startsWith("/checkout")) {
    return {
      ...baseMetadata,
      title: "Secure Checkout - ShopYTL",
      description: "Complete your purchase with our secure checkout system.",
    };
  }

  if (path.startsWith("/compare")) {
    return {
      ...baseMetadata,
      title: "Compare Products - ShopYTL",
      description: "Compare building materials side-by-side.",
    };
  }

  if (path.startsWith("/wishlist")) {
    return {
      ...baseMetadata,
      title: "Your Wishlist - ShopYTL",
      description: "Save products you love for future purchases.",
    };
  }

  if (path.startsWith("/profile")) {
    return {
      ...baseMetadata,
      title: "Your Profile - ShopYTL",
      description: "Manage your account, orders, and preferences.",
    };
  }

  if (path.startsWith("/notifications")) {
    return {
      ...baseMetadata,
      title: "Notifications - ShopYTL",
      description: "Stay updated with your order and product alerts.",
    };
  }

  if (path.startsWith("/faq")) {
    return {
      ...baseMetadata,
      title: "FAQ - ShopYTL",
      description: "Find answers to frequently asked questions.",
    };
  }

  if (path.startsWith("/contact")) {
    return {
      ...baseMetadata,
      title: "Contact Us - ShopYTL",
      description: "Get in touch with our support or sales team.",
    };
  }

  if (path.startsWith("/about")) {
    return {
      ...baseMetadata,
      title: "About Us - ShopYTL",
      description: "Learn more about our company and mission.",
    };
  }

  if (path.startsWith("/blog")) {
    return {
      ...baseMetadata,
      title: "Blog - ShopYTL",
      description: "Explore insights, tips, and stories from ShopYTL.",
    };
  }

  if (path.startsWith("/category")) {
    return {
      ...baseMetadata,
      title: "Categories - ShopYTL",
      description: "Explore products by category.",
    };
  }

  return {
    ...baseMetadata,
    title: "ShopYTL",
    description: "Your go-to destination for quality building materials.",
  };
}
