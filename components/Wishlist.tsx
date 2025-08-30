"use client";

import { useState } from "react";
import { Heart, Trash2, ShoppingCart, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { useWishlist } from "./WishlistProvider";
import { removeFromWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { TypographyH4, TypographyP } from "@/components/ui/Typography";
import Image from "next/image";
import Link from "next/link";
import type { WishlistWithItem } from "@/types/wishlist";
import { toast } from "sonner";

export default function Wishlist() {
  const { wishlistCount, wishlistItems, refreshWishlist, isLoading } =
    useWishlist();
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WishlistWithItem | null>(
    null
  );
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedDeliveryTypes, setSelectedDeliveryTypes] = useState<{
    [key: string]: string;
  }>({});

  const blogItems = wishlistItems.filter(
    (item) => item.item_type === "blog" && item.blog
  );
  const productItems = wishlistItems.filter(
    (item) => item.item_type === "product" && item.product
  );

  const handleDeleteClick = (item: WishlistWithItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete && user?.id) {
      const result = await removeFromWishlist(
        itemToDelete.item_type,
        itemToDelete.item_id,
        user.id
      );

      if (result.success) {
        toast.success("Removed from wishlist");
        refreshWishlist();
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        toast.error("Failed to remove from wishlist");
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleAddToCart = async (productId: string, deliveryType?: string) => {
    if (!user?.id) {
      toast.error("Please login to add items to cart");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    const result = await addToCart(
      user.id,
      productId,
      1,
      deliveryType || "normal"
    );

    if (result.success) {
      if (result.isUpdate) {
        toast.success("Quantity updated!", {
          description: `Product quantity increased to ${result.newQuantity}.`,
        });
      } else {
        toast.success("Added to cart!", {
          description: "Product has been added to your cart.",
        });
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } else {
      toast.error("Failed to add item to cart");
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: false }));
  };

  const BlogItem = ({ item }: { item: WishlistWithItem }) => {
    const blog = item.blog!;
    const mainImage =
      blog.blog_images?.[0]?.image_url || blog.image_url || "/placeholder.svg";

    return (
      <div className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg transition-colors">
        <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
          <Image
            src={mainImage}
            alt={blog.title}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <TypographyH4 className="text-sm mb-1 line-clamp-2">
            {blog.title}
          </TypographyH4>
          <TypographyP className="text-xs text-gray-500 mb-2 line-clamp-2 !mt-0">
            {blog.description}
          </TypographyP>
          <TypographyP className="text-xs text-gray-400 mb-2 !mt-0">
            Added: {new Date(item.created_at).toLocaleDateString()}
          </TypographyP>
          {blog.blog_tags && blog.blog_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {blog.blog_tags
                .flatMap((bt) => bt.tags)
                .slice(0, 2)
                .map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Link href={`/blogs/${blog.id}`} onClick={() => setIsOpen(false)}>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Read More
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => handleDeleteClick(item)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const ProductItem = ({ item }: { item: WishlistWithItem }) => {
    const product = item.product!;
    const mainImage =
      product.product_images?.find((img) => img.is_primary)?.image_url ||
      product.product_images?.[0]?.image_url ||
      "/placeholder.svg";
    const isAddingToCartLoading = addingToCart[product.id];

    // Create delivery options for this product
    const deliveryOptions = [
      product.normal_price != null
        ? {
            key: "normal",
            label: "Normal Delivery",
            price: product.normal_price,
          }
        : null,
      product.pump_price != null
        ? { key: "pump", label: "Pump Delivery", price: product.pump_price }
        : null,
      product.tremie_1_price != null
        ? { key: "tremie_1", label: "Tremie 1", price: product.tremie_1_price }
        : null,
      product.tremie_2_price != null
        ? { key: "tremie_2", label: "Tremie 2", price: product.tremie_2_price }
        : null,
      product.tremie_3_price != null
        ? { key: "tremie_3", label: "Tremie 3", price: product.tremie_3_price }
        : null,
    ].filter(Boolean) as { key: string; label: string; price: number }[];

    const selectedDelivery =
      selectedDeliveryTypes[product.id] || deliveryOptions[0]?.key || "normal";
    const selectedOption = deliveryOptions.find(
      (opt) => opt.key === selectedDelivery
    );
    const displayPrice = selectedOption?.price || product.normal_price;

    const handleDeliveryChange = (value: string) => {
      setSelectedDeliveryTypes((prev) => ({
        ...prev,
        [product.id]: value,
      }));
    };

    return (
      <div className="flex flex-col gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg transition-colors">
        {/* Product Info Row */}
        <div className="flex gap-3">
          <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
            <Image
              src={mainImage}
              alt={product.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <TypographyH4 className="text-sm mb-1 line-clamp-2">
              {product.name}
            </TypographyH4>
            <TypographyP className="text-xs text-gray-500 mb-1 !mt-0">
              Grade: {product.grade}
            </TypographyP>
            <TypographyP className="text-xs text-gray-500 mb-1 !mt-0">
              Price: RM{displayPrice?.toFixed(2) || "N/A"}
              {deliveryOptions.length === 1 && (
                <span className="ml-1 text-blue-600">
                  ({deliveryOptions[0].label})
                </span>
              )}
            </TypographyP>
            <TypographyP className="text-xs text-gray-400 mb-1 !mt-0">
              Added: {new Date(item.created_at).toLocaleDateString()}
            </TypographyP>
          </div>
        </div>

        {/* Delivery Selection Row (if multiple options) */}
        {deliveryOptions.length > 1 && (
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
            <label className="text-xs text-gray-500">Delivery:</label>
            <Select
              value={selectedDelivery}
              onValueChange={handleDeliveryChange}
            >
              <SelectTrigger className="flex-1 h-8 px-2 py-1 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deliveryOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={() => handleAddToCart(product.id, selectedDelivery)}
            disabled={isAddingToCartLoading}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            {isAddingToCartLoading ? "Adding..." : "Add to Cart"}
          </Button>
          <Link
            href={`/products/${product.id}`}
            onClick={() => setIsOpen(false)}
          >
            <Button size="sm" variant="ghost" className="h-8 text-xs px-3">
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => handleDeleteClick(item)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg h-screen flex flex-col">
          <SheetHeader className="space-y-2 pb-4">
            <SheetTitle className="text-lg font-medium text-left">
              My Wishlist
            </SheetTitle>
            {wishlistCount > 0 && (
              <TypographyP className="text-sm text-gray-500 !mt-1">
                {wishlistCount} {wishlistCount === 1 ? "item" : "items"} in your
                wishlist
              </TypographyP>
            )}
          </SheetHeader>

          {/* Make this div scrollable like Cart */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <TypographyP className="text-sm text-muted-foreground">
                      Loading wishlist...
                    </TypographyP>
                  </div>
                </div>
              ) : !user ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Heart className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <TypographyH4 className="text-gray-900 dark:text-gray-100">
                      Login Required
                    </TypographyH4>
                    <TypographyP className="text-sm text-muted-foreground max-w-sm">
                      Please login to view your wishlist and save your favorite
                      items.
                    </TypographyP>
                  </div>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button>Login to Continue</Button>
                  </Link>
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Heart className="h-12 w-12 text-gray-500" />
                  </div>
                  <div className="space-y-3">
                    <TypographyH4 className="text-gray-900 dark:text-gray-100">
                      Your wishlist is empty
                    </TypographyH4>
                    <TypographyP className="text-sm text-muted-foreground max-w-sm">
                      Start adding your favorite products and blogs to your
                      wishlist.
                    </TypographyP>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/products" onClick={() => setIsOpen(false)}>
                      <Button variant="outline">Browse Products</Button>
                    </Link>
                    <Link href="/blogs" onClick={() => setIsOpen(false)}>
                      <Button variant="outline">Browse Blogs</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="h-full">
                    <Tabs defaultValue="all" className="h-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0">
                        <TabsTrigger value="all">
                          All ({wishlistCount})
                        </TabsTrigger>
                        <TabsTrigger value="products">
                          Products ({productItems.length})
                        </TabsTrigger>
                        <TabsTrigger value="blogs">
                          Blogs ({blogItems.length})
                        </TabsTrigger>
                      </TabsList>
                      <div className="flex-1 min-h-0">
                        <TabsContent value="all" className="mt-0 h-full">
                          <div className="space-y-4">
                            {wishlistItems.map((item) => (
                              <div key={item.id}>
                                {item.item_type === "blog" && item.blog && (
                                  <BlogItem item={item} />
                                )}
                                {item.item_type === "product" &&
                                  item.product && <ProductItem item={item} />}
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="products"
                          className="mt-0 flex-1 flex items-center justify-center"
                        >
                          {productItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 text-center space-y-4 h-[500px]">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="space-y-2">
                                <TypographyH4 className="text-gray-700 dark:text-gray-300 text-sm">
                                  No products in your wishlist yet
                                </TypographyH4>
                                <TypographyP className="text-xs text-muted-foreground max-w-xs">
                                  Start browsing our amazing products and add
                                  them to your wishlist.
                                </TypographyP>
                              </div>
                              <Link
                                href="/products"
                                onClick={() => setIsOpen(false)}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  Browse Products
                                </Button>
                              </Link>
                            </div>
                          ) : (
                            <div className="w-full space-y-4">
                              {productItems.map((item) => (
                                <ProductItem key={item.id} item={item} />
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="blogs" className="mt-0 flex-1 flex">
                          {blogItems.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center space-y-4 h-[500px]">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Heart className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="space-y-2">
                                <TypographyH4 className="text-gray-700 dark:text-gray-300 text-sm">
                                  No blogs in your wishlist yet
                                </TypographyH4>
                                <TypographyP className="text-xs text-muted-foreground max-w-xs">
                                  Discover interesting articles and save them to
                                  your wishlist.
                                </TypographyP>
                              </div>
                              <Link
                                href="/blogs"
                                onClick={() => setIsOpen(false)}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  Browse Blogs
                                </Button>
                              </Link>
                            </div>
                          ) : (
                            <div className="flex-1 overflow-y-auto space-y-4">
                              {blogItems.map((item) => (
                                <BlogItem key={item.id} item={item} />
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Wishlist Footer */}
            {user && wishlistItems.length > 0 && (
              <div className="border-t p-4 space-y-4 bg-gray-50 dark:bg-gray-900/30">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-red-500">
                    {wishlistCount} {wishlistCount === 1 ? "item" : "items"}
                  </span>
                </div>
                <TypographyP className="text-xs text-gray-500 text-center !mt-2">
                  View and manage your wishlist items
                </TypographyP>
                <div className="space-y-3">
                  <Link href="/wishlists" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                      View & Edit Wishlist ({wishlistCount})
                    </Button>
                  </Link>
                  <TypographyP className="text-xs text-center text-gray-500 !mt-2">
                    Select items and manage your wishlist before checkout
                  </TypographyP>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your wishlist? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {itemToDelete && (
            <div className="flex gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={
                    itemToDelete.item_type === "blog"
                      ? itemToDelete.blog?.blog_images?.[0]?.image_url ||
                        itemToDelete.blog?.image_url ||
                        "/placeholder.svg"
                      : itemToDelete.product?.product_images?.find(
                          (img) => img.is_primary
                        )?.image_url ||
                        itemToDelete.product?.product_images?.[0]?.image_url ||
                        "/placeholder.svg"
                  }
                  alt={
                    itemToDelete.item_type === "blog"
                      ? itemToDelete.blog?.title || "Blog"
                      : itemToDelete.product?.name || "Product"
                  }
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <TypographyH4 className="text-sm mb-1">
                  {itemToDelete.item_type === "blog"
                    ? itemToDelete.blog?.title
                    : itemToDelete.product?.name}
                </TypographyH4>
                <TypographyP className="text-sm text-gray-500 mb-1 !mt-0 capitalize">
                  {itemToDelete.item_type}
                </TypographyP>
                <TypographyP className="text-sm text-gray-400 !mt-0">
                  Added:{" "}
                  {new Date(itemToDelete.created_at).toLocaleDateString()}
                </TypographyP>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove from Wishlist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
