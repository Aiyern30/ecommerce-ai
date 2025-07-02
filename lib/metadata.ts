export function getMetadataForPath(path: string) {
  if (path.startsWith("/staff")) {
    return {
      title: "Staff Panel - ShopYTL",
      description: "Internal tools for managing ShopYTL.",
    };
  }

  if (path.startsWith("/products")) {
    return {
      title: "Our Products - ShopYTL",
      description: "Browse our latest building materials and products.",
    };
  }

  if (path.startsWith("/posts")) {
    return {
      title: "Posts & Updates - ShopYTL",
      description: "Latest industry insights and company announcements.",
    };
  }

  return {
    title: "ShopYTL",
    description: "Your go-to destination for quality products.",
  };
}
