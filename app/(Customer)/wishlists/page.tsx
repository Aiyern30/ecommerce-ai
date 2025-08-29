"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Trash2,
  ShoppingCart,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Skeleton,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  TypographyH1,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { toast } from "sonner";
import { useWishlist } from "@/components/WishlistProvider";
import { removeFromWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart/utils";
import { useUser } from "@supabase/auth-helpers-react";
import type { WishlistWithItem } from "@/types/wishlist";
import { useDeviceType } from "@/utils/useDeviceTypes";

export default function WishlistPage() {
  const { wishlistItems, refreshWishlist, isLoading, wishlistCount } =
    useWishlist();
  const { isMobile } = useDeviceType();
  const user = useUser();
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
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeTab, setActiveTab] = useState("all");

  const blogItems = wishlistItems.filter(
    (item) => item.item_type === "blog" && item.blog
  );
  const productItems = wishlistItems.filter(
    (item) => item.item_type === "product" && item.product
  );

  const selectedWishlistItems = wishlistItems.filter(
    (item) => selectedItems[item.id]
  );
  const selectAll =
    wishlistItems.length > 0 &&
    wishlistItems.every((item) => selectedItems[item.id]);

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: checked }));
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelectedItems: { [key: string]: boolean } = {};
    wishlistItems.forEach((item) => {
      newSelectedItems[item.id] = checked;
    });
    setSelectedItems(newSelectedItems);
    toast.success(checked ? "All items selected" : "All items deselected");
  };

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
        // Remove from selected items
        setSelectedItems((prev) => {
          const newSelected = { ...prev };
          delete newSelected[itemToDelete.id];
          return newSelected;
        });
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

  const handleBulkDelete = async () => {
    if (!user?.id) return;

    const itemsToDelete = selectedWishlistItems;
    if (itemsToDelete.length === 0) {
      toast.error("Please select items to remove");
      return;
    }

    for (const item of itemsToDelete) {
      await removeFromWishlist(item.item_type, item.item_id, user.id);
    }

    toast.success(`Removed ${itemsToDelete.length} items from wishlist`);
    refreshWishlist();
    window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    setSelectedItems({});
  };

  const handleBulkAddToCart = async () => {
    if (!user?.id) return;

    const productsToAdd = selectedWishlistItems.filter(
      (item) => item.item_type === "product" && item.product
    );
    if (productsToAdd.length === 0) {
      toast.error("Please select products to add to cart");
      return;
    }

    let successCount = 0;
    for (const item of productsToAdd) {
      const product = item.product!;

      // Create delivery options for this product to get the correct delivery type
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
          ? {
              key: "tremie_1",
              label: "Tremie 1",
              price: product.tremie_1_price,
            }
          : null,
        product.tremie_2_price != null
          ? {
              key: "tremie_2",
              label: "Tremie 2",
              price: product.tremie_2_price,
            }
          : null,
        product.tremie_3_price != null
          ? {
              key: "tremie_3",
              label: "Tremie 3",
              price: product.tremie_3_price,
            }
          : null,
      ].filter(Boolean) as { key: string; label: string; price: number }[];

      // Get the selected delivery type or fall back to the first available option
      const selectedDeliveryType =
        selectedDeliveryTypes[product.id] ||
        deliveryOptions[0]?.key ||
        "normal";

      const result = await addToCart(
        user.id,
        product.id,
        1,
        selectedDeliveryType
      );
      if (result.success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`Added ${successCount} products to cart`);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  };

  return (
    <div className="min-h-screen mb-4">
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">MY WISHLIST</TypographyH1>

        {isLoading ? (
          <div className="mt-8">
            {isMobile ? (
              <div className="space-y-6 max-w-full overflow-hidden">
                <div className="w-full">
                  <Card className="overflow-hidden shadow-sm p-0">
                    <CardHeader className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
                        <Skeleton className="h-6 w-40 flex-shrink-0" />
                      </div>
                      <Skeleton className="h-4 w-32 mt-2" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {[...Array(2)].map((_, index) => (
                          <div key={index} className="p-4">
                            <div className="flex gap-3">
                              <div className="flex items-start pt-2 flex-shrink-0">
                                <Skeleton className="h-5 w-5 rounded" />
                              </div>
                              <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
                              <div className="flex-1 min-w-0 space-y-2">
                                <Skeleton className="h-5 w-full max-w-[180px]" />
                                <div className="flex gap-4">
                                  <Skeleton className="h-3 w-16" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                  <Skeleton className="h-6 w-16" />
                                  <Skeleton className="h-8 w-24 rounded-lg" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden shadow-sm p-0">
                    <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-7 w-48" />
                        <div className="ml-auto">
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {[...Array(2)].map((_, index) => (
                          <div key={index} className="p-6">
                            <div className="flex gap-4">
                              <div className="flex items-start pt-3">
                                <Skeleton className="h-5 w-5 rounded" />
                              </div>
                              <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-xl" />
                              <div className="flex-1 flex flex-col justify-between min-h-[96px] md:min-h-[112px]">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                  <div className="flex-1 pr-2 space-y-2">
                                    <Skeleton className="h-7 w-64" />
                                    <div className="flex gap-4">
                                      <Skeleton className="h-4 w-20" />
                                      <Skeleton className="h-4 w-24" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-9 w-9 rounded-lg ml-auto md:ml-0" />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                  <Skeleton className="h-8 w-20" />
                                  <Skeleton className="h-10 w-28 rounded-lg" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Login Required
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Please login to view your wishlist and save your favorite items.
              </p>
            </div>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] space-y-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
              <p className="text-muted-foreground max-w-sm">
                Start adding your favorite products and blogs to your wishlist.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/products">
                <Button variant="outline">Browse Products</Button>
              </Link>
              <Link href="/blogs">
                <Button>Browse Blogs</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={`mt-8 ${
              isMobile ? "space-y-6" : "grid gap-8 lg:grid-cols-3"
            }`}
          >
            <div className={isMobile ? "" : "lg:col-span-2 space-y-6"}>
              <Card className="overflow-hidden shadow-sm py-0 gap-0">
                <CardHeader
                  className={`${
                    isMobile ? "p-4" : "p-6"
                  } bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={(checked) => {
                          handleSelectAll(checked === true);
                        }}
                        className="h-5 w-5"
                      />
                      <CardTitle
                        className={`${
                          isMobile ? "text-lg" : "text-xl"
                        } font-bold cursor-pointer`}
                      >
                        Choose All Items
                      </CardTitle>
                    </div>
                    <TypographyP
                      className={`text-sm text-gray-600 dark:text-gray-400 font-medium !mt-0 ${
                        isMobile ? "hidden" : ""
                      }`}
                    >
                      {selectedWishlistItems.length} of {wishlistCount} items
                      selected
                    </TypographyP>
                  </div>
                  {isMobile && (
                    <TypographyP className="text-xs text-gray-600 dark:text-gray-400 font-medium !mt-2">
                      {selectedWishlistItems.length} of {wishlistCount} items
                      selected
                    </TypographyP>
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs
                    defaultValue="all"
                    className="w-full"
                    onValueChange={setActiveTab}
                  >
                    <div className="px-6 pt-4">
                      <TabsList className="grid w-full grid-cols-3">
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
                    </div>

                    <TabsContent value="all" className="mt-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {wishlistItems.map((item) => (
                          <WishlistItem
                            key={item.id}
                            item={item}
                            isMobile={isMobile}
                            isSelected={selectedItems[item.id] || false}
                            onSelect={handleItemSelect}
                            onDelete={handleDeleteClick}
                            onAddToCart={handleAddToCart}
                            addingToCart={addingToCart}
                            selectedDeliveryTypes={selectedDeliveryTypes}
                            setSelectedDeliveryTypes={setSelectedDeliveryTypes}
                          />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="products" className="mt-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {productItems.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ShoppingCart className="h-8 w-8 text-gray-400" />
                            </div>
                            <TypographyH3 className="text-gray-700 dark:text-gray-300 mb-2">
                              No products in your wishlist yet
                            </TypographyH3>
                            <TypographyP className="text-muted-foreground mb-4">
                              Start browsing our amazing products and add them
                              to your wishlist.
                            </TypographyP>
                            <Link href="/products">
                              <Button>Browse Products</Button>
                            </Link>
                          </div>
                        ) : (
                          productItems.map((item) => (
                            <WishlistItem
                              key={item.id}
                              item={item}
                              isMobile={isMobile}
                              isSelected={selectedItems[item.id] || false}
                              onSelect={handleItemSelect}
                              onDelete={handleDeleteClick}
                              onAddToCart={handleAddToCart}
                              addingToCart={addingToCart}
                              selectedDeliveryTypes={selectedDeliveryTypes}
                              setSelectedDeliveryTypes={
                                setSelectedDeliveryTypes
                              }
                            />
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="blogs" className="mt-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {blogItems.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                            <TypographyH3 className="text-gray-700 dark:text-gray-300 mb-2">
                              No blogs in your wishlist yet
                            </TypographyH3>
                            <TypographyP className="text-muted-foreground mb-4">
                              Discover interesting articles and save them to
                              your wishlist.
                            </TypographyP>
                            <Link href="/blogs">
                              <Button>Browse Blogs</Button>
                            </Link>
                          </div>
                        ) : (
                          blogItems.map((item) => (
                            <WishlistItem
                              key={item.id}
                              item={item}
                              isMobile={isMobile}
                              isSelected={selectedItems[item.id] || false}
                              onSelect={handleItemSelect}
                              onDelete={handleDeleteClick}
                              onAddToCart={handleAddToCart}
                              addingToCart={addingToCart}
                              selectedDeliveryTypes={selectedDeliveryTypes}
                              setSelectedDeliveryTypes={
                                setSelectedDeliveryTypes
                              }
                            />
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Wishlist Actions Sidebar */}
            <div className={isMobile ? "" : "lg:col-span-1"}>
              <div className={isMobile ? "" : "sticky top-6 z-10"}>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Wishlist Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Items</span>
                      <span className="text-lg font-bold text-red-500">
                        {wishlistCount}
                      </span>
                    </div>

                    {selectedWishlistItems.length > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Selected
                          </span>
                          <span className="text-sm font-semibold text-blue-600">
                            {selectedWishlistItems.length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {/* Show Add to Cart button for All and Products tabs */}
                          {(activeTab === "all" ||
                            activeTab === "products") && (
                            <Button
                              onClick={handleBulkAddToCart}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={
                                selectedWishlistItems.filter(
                                  (item) => item.item_type === "product"
                                ).length === 0
                              }
                            >
                              {activeTab === "all"
                                ? "Add Selected Products to Cart"
                                : "Add Selected to Cart"}
                            </Button>
                          )}

                          {/* Remove button for all tabs */}
                          <Button
                            onClick={handleBulkDelete}
                            variant="outline"
                            className="w-full text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Remove Selected Items
                          </Button>
                        </div>

                        {/* Show additional info for All tab when both products and blogs are selected */}
                        {activeTab === "all" && (
                          <div className="text-xs text-gray-500 space-y-1">
                            {selectedWishlistItems.filter(
                              (item) => item.item_type === "product"
                            ).length > 0 && (
                              <p>
                                •{" "}
                                {
                                  selectedWishlistItems.filter(
                                    (item) => item.item_type === "product"
                                  ).length
                                }{" "}
                                product(s) will be added to cart
                              </p>
                            )}
                            {selectedWishlistItems.filter(
                              (item) => item.item_type === "blog"
                            ).length > 0 && (
                              <p>
                                •{" "}
                                {
                                  selectedWishlistItems.filter(
                                    (item) => item.item_type === "blog"
                                  ).length
                                }{" "}
                                blog(s) will be removed (blogs cannot be added
                                to cart)
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <div className="pt-4 border-t">
                      <TypographyP className="text-xs text-gray-500 text-center">
                        {activeTab === "all"
                          ? "Select items to perform bulk actions"
                          : activeTab === "products"
                          ? "Select products to add to cart or remove"
                          : "Select blogs to remove from wishlist"}
                      </TypographyP>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={`${isMobile ? "max-w-sm mx-4" : "max-w-md"}`}
        >
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
                <TypographyH3 className="text-sm mb-1">
                  {itemToDelete.item_type === "blog"
                    ? itemToDelete.blog?.title
                    : itemToDelete.product?.name}
                </TypographyH3>
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
    </div>
  );
}

// Component for individual wishlist items
function WishlistItem({
  item,
  isMobile,
  isSelected,
  onSelect,
  onDelete,
  onAddToCart,
  addingToCart,
  selectedDeliveryTypes,
  setSelectedDeliveryTypes,
}: {
  item: WishlistWithItem;
  isMobile: boolean;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDelete: (item: WishlistWithItem) => void;
  onAddToCart: (productId: string, deliveryType?: string) => void;
  addingToCart: { [key: string]: boolean };
  selectedDeliveryTypes: { [key: string]: string };
  setSelectedDeliveryTypes: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
}) {
  const router = useRouter();

  const handleItemClick = () => {
    if (item.item_type === "blog" && item.blog) {
      router.push(`/blogs/${item.blog.id}`);
    } else if (item.item_type === "product" && item.product) {
      router.push(`/products/${item.product.id}`);
    }
  };

  // Product-specific logic
  if (item.item_type === "product" && item.product) {
    const product = item.product;
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
    const isAddingToCartLoading = addingToCart[product.id];

    const handleDeliveryChange = (value: string) => {
      setSelectedDeliveryTypes((prev) => ({
        ...prev,
        [product.id]: value,
      }));
    };

    return (
      <div
        className={`${
          isMobile ? "p-4" : "p-6"
        } hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all duration-200 cursor-pointer group`}
      >
        <div className={`flex ${isMobile ? "gap-3" : "gap-4"}`}>
          <div className={`flex items-start ${isMobile ? "pt-2" : "pt-3"}`}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelect(item.id, checked as boolean)
              }
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5"
            />
          </div>
          <div
            className={`relative ${
              isMobile ? "h-20 w-20" : "h-24 w-24 md:h-28 md:w-28"
            } flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700`}
          >
            <Image
              src={
                product.product_images?.find((img) => img.is_primary)
                  ?.image_url ||
                product.product_images?.[0]?.image_url ||
                "/placeholder.svg"
              }
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div
            className={`flex flex-1 flex-col justify-between ${
              isMobile ? "min-h-[80px]" : "min-h-[96px] md:min-h-[112px]"
            }`}
          >
            <div
              className={`flex ${
                isMobile
                  ? "flex-col"
                  : "flex-col md:flex-row md:justify-between md:items-start"
              }`}
            >
              <div className="flex-1 pr-2">
                <button
                  onClick={handleItemClick}
                  className="text-left w-full p-0 border-none bg-transparent"
                >
                  <TypographyH3
                    className={`font-bold ${
                      isMobile ? "text-base leading-tight" : "text-xl"
                    } mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer`}
                  >
                    {product.name}
                  </TypographyH3>
                </button>
                <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Grade: {product.grade}</span>
                  <span>Unit: {product.unit || "per m³"}</span>
                  <span className="text-xs">
                    Added: {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Delivery Type Selection */}
                {deliveryOptions.length > 1 && (
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-gray-500">Delivery:</label>
                    <Select
                      value={selectedDelivery}
                      onValueChange={handleDeliveryChange}
                    >
                      <SelectTrigger className="w-32 h-6 px-2 py-1 text-xs">
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

                <div
                  className={`${
                    isMobile ? "text-lg" : "text-2xl"
                  } font-bold text-gray-900 dark:text-gray-100 mb-2`}
                >
                  RM{displayPrice?.toFixed(2) || "N/A"}
                  {deliveryOptions.length === 1 && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {deliveryOptions[0].label}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className={`text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200 ${
                  isMobile
                    ? "absolute top-2 right-2 opacity-70"
                    : "ml-auto md:ml-0 opacity-0 group-hover:opacity-100"
                }`}
              >
                <Trash2 className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product.id, selectedDelivery);
                }}
                disabled={isAddingToCartLoading}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {isAddingToCartLoading ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleItemClick}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Blog-specific logic
  if (item.item_type === "blog" && item.blog) {
    const blog = item.blog;
    const mainImage =
      blog.blog_images?.[0]?.image_url || blog.image_url || "/placeholder.svg";

    return (
      <div
        className={`${
          isMobile ? "p-4" : "p-6"
        } hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all duration-200 cursor-pointer group`}
      >
        <div className={`flex ${isMobile ? "gap-3" : "gap-4"}`}>
          <div className={`flex items-start ${isMobile ? "pt-2" : "pt-3"}`}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelect(item.id, checked as boolean)
              }
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5"
            />
          </div>
          <div
            className={`relative ${
              isMobile ? "h-20 w-20" : "h-24 w-24 md:h-28 md:w-28"
            } flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700`}
          >
            <Image
              src={mainImage}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div
            className={`flex flex-1 flex-col justify-between ${
              isMobile ? "min-h-[80px]" : "min-h-[96px] md:min-h-[112px]"
            }`}
          >
            <div
              className={`flex ${
                isMobile
                  ? "flex-col"
                  : "flex-col md:flex-row md:justify-between md:items-start"
              }`}
            >
              <div className="flex-1 pr-2">
                <button
                  onClick={handleItemClick}
                  className="text-left w-full p-0 border-none bg-transparent"
                >
                  <TypographyH3
                    className={`font-bold ${
                      isMobile ? "text-base leading-tight" : "text-xl"
                    } mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer`}
                  >
                    {blog.title}
                  </TypographyH3>
                </button>
                <TypographyP className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                  {blog.description}
                </TypographyP>
                <TypographyP className="text-xs text-gray-400 mb-2">
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
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className={`text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200 ${
                  isMobile
                    ? "absolute top-2 right-2 opacity-70"
                    : "ml-auto md:ml-0 opacity-0 group-hover:opacity-100"
                }`}
              >
                <Trash2 className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleItemClick}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Read More
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
