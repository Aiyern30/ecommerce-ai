import type { Metadata } from "next";

export function getMetadataForPath(path: string): Metadata {
  // Staff section
  if (path.startsWith("/staff/dashboard")) {
    return {
      title: "Staff Dashboard - ShopYTL",
      description: "Overview and key metrics for internal operations.",
    };
  }

  if (path.startsWith("/staff/products")) {
    return {
      title: "Staff Products Management - ShopYTL",
      description: "Manage and update products available in the store.",
    };
  }

  if (path.startsWith("/staff/orders")) {
    return {
      title: "Staff Orders - ShopYTL",
      description: "View and process customer orders efficiently.",
    };
  }

  if (path.startsWith("/staff/posts")) {
    return {
      title: "Staff Posts - ShopYTL",
      description: "Manage blog posts, news, and company announcements.",
    };
  }

  if (path.startsWith("/staff")) {
    return {
      title: "Staff Panel - ShopYTL",
      description: "Internal tools for managing ShopYTL.",
    };
  }

  // Customer pages
  if (path.startsWith("/products")) {
    return {
      title: "Our Products - ShopYTL",
      description: "Browse our latest building materials and products.",
    };
  }

  if (path.startsWith("/cart")) {
    return {
      title: "Your Shopping Cart - ShopYTL",
      description: "Review and manage items in your cart before checkout.",
    };
  }

  if (path.startsWith("/checkout")) {
    return {
      title: "Secure Checkout - ShopYTL",
      description: "Complete your purchase with our secure checkout system.",
    };
  }

  if (path.startsWith("/compare")) {
    return {
      title: "Compare Products - ShopYTL",
      description: "Compare building materials side-by-side.",
    };
  }

  if (path.startsWith("/wishlist")) {
    return {
      title: "Your Wishlist - ShopYTL",
      description: "Save products you love for future purchases.",
    };
  }

  if (path.startsWith("/profile")) {
    return {
      title: "Your Profile - ShopYTL",
      description: "Manage your account, orders, and preferences.",
    };
  }

  if (path.startsWith("/notifications")) {
    return {
      title: "Notifications - ShopYTL",
      description: "Stay updated with your order and product alerts.",
    };
  }

  if (path.startsWith("/faq")) {
    return {
      title: "FAQ - ShopYTL",
      description: "Find answers to frequently asked questions.",
    };
  }

  if (path.startsWith("/contact")) {
    return {
      title: "Contact Us - ShopYTL",
      description: "Get in touch with our support or sales team.",
    };
  }

  if (path.startsWith("/about")) {
    return {
      title: "About Us - ShopYTL",
      description: "Learn more about our company and mission.",
    };
  }

  if (path.startsWith("/blog")) {
    return {
      title: "Blog - ShopYTL",
      description: "Explore insights, tips, and stories from ShopYTL.",
    };
  }

  if (path.startsWith("/category")) {
    return {
      title: "Categories - ShopYTL",
      description: "Explore products by category.",
    };
  }

  return {
    title: "ShopYTL",
    description: "Your go-to destination for quality building materials.",
  };
}
