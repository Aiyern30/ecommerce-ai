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
  authors: [{ name: "YTL Concrete Hub" }],
  creator: "YTL Concrete Hub",
  publisher: "YTL Concrete Hub",
  category: "ecommerce",
  keywords: [
    "ecommerce",
    "building materials",
    "construction",
    "YTL",
    "concrete",
    "cement",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "YTL Concrete Hub",
    images: [
      {
        url: "/icon-512x512.svg",
        width: 512,
        height: 512,
        alt: "YTL Concrete Hub Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    creator: "@YTLConcreteHub",
    images: ["/icon-512x512.svg"],
  },
};

export function getMetadataForPath(path: string): Metadata {
  // Staff section
  if (path.startsWith("/staff/dashboard")) {
    return {
      ...baseMetadata,
      title: "Staff Dashboard - YTL Concrete Hub",
      description: "Overview and key metrics for internal operations.",
    };
  }

  if (path.startsWith("/staff/products")) {
    return {
      ...baseMetadata,
      title: "Staff Products Management - YTL Concrete Hub",
      description: "Manage and update products available in the store.",
    };
  }

  if (path.startsWith("/staff/orders")) {
    return {
      ...baseMetadata,
      title: "Staff Orders - YTL Concrete Hub",
      description: "View and process customer orders efficiently.",
    };
  }

  if (path.startsWith("/staff/posts")) {
    return {
      ...baseMetadata,
      title: "Staff Posts - YTL Concrete Hub",
      description: "Manage blog posts, news, and company announcements.",
    };
  }

  if (path.startsWith("/staff")) {
    return {
      ...baseMetadata,
      title: "Staff Panel - YTL Concrete Hub",
      description: "Internal tools for managing YTL Concrete Hub.",
    };
  }

  // Customer pages
  if (path.startsWith("/products")) {
    return {
      ...baseMetadata,
      title: "Our Products - YTL Concrete Hub",
      description:
        "Browse our latest building materials and concrete products.",
    };
  }

  if (path.startsWith("/cart")) {
    return {
      ...baseMetadata,
      title: "Your Shopping Cart - YTL Concrete Hub",
      description: "Review and manage items in your cart before checkout.",
    };
  }

  if (path.startsWith("/checkout")) {
    return {
      ...baseMetadata,
      title: "Secure Checkout - YTL Concrete Hub",
      description: "Complete your purchase with our secure checkout system.",
    };
  }

  if (path.startsWith("/compare")) {
    return {
      ...baseMetadata,
      title: "Compare Products - YTL Concrete Hub",
      description:
        "Compare building materials and concrete products side-by-side.",
    };
  }

  if (path.startsWith("/wishlist")) {
    return {
      ...baseMetadata,
      title: "Your Wishlist - YTL Concrete Hub",
      description: "Save products you love for future purchases.",
    };
  }

  if (path.startsWith("/profile")) {
    return {
      ...baseMetadata,
      title: "Your Profile - YTL Concrete Hub",
      description: "Manage your account, orders, and preferences.",
    };
  }

  if (path.startsWith("/notifications")) {
    return {
      ...baseMetadata,
      title: "Notifications - YTL Concrete Hub",
      description: "Stay updated with your order and product alerts.",
    };
  }

  if (path.startsWith("/faq")) {
    return {
      ...baseMetadata,
      title: "FAQ - YTL Concrete Hub",
      description: "Find answers to frequently asked questions.",
    };
  }

  if (path.startsWith("/contact")) {
    return {
      ...baseMetadata,
      title: "Contact Us - YTL Concrete Hub",
      description: "Get in touch with our support or sales team.",
    };
  }

  if (path.startsWith("/about")) {
    return {
      ...baseMetadata,
      title: "About Us - YTL Concrete Hub",
      description: "Learn more about our company and mission.",
    };
  }

  if (path.startsWith("/blog")) {
    return {
      ...baseMetadata,
      title: "Blog - YTL Concrete Hub",
      description: "Explore insights, tips, and stories from YTL Concrete Hub.",
    };
  }

  if (path.startsWith("/category")) {
    return {
      ...baseMetadata,
      title: "Categories - YTL Concrete Hub",
      description: "Explore products by category.",
    };
  }

  return {
    ...baseMetadata,
    title: "YTL Concrete Hub",
    description:
      "Your go-to destination for quality concrete and building materials.",
  };
}
