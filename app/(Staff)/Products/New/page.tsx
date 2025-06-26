"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import the singleton Supabase client
import * as z from "zod";
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/";
import Image from "next/image";
import { toast } from "sonner";

// Zod schema for product creation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().nullish(), // Allow null or undefined for optional textareas
  price: z.coerce.number().min(0.01, "Price must be positive"), // Use coerce to handle string to number conversion
  unit: z.enum(["per bag", "per tonne"], {
    required_error: "Unit is required",
  }),
  stock_quantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be non-negative"), // Use coerce
  category: z.enum(["bagged", "bulk", "ready-mix"], {
    required_error: "Category is required",
  }),
  // imageFile is handled separately as a File object, not directly in Zod schema for form fields
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: null,
      price: 0, // Default to 0 for number inputs
      unit: "per bag",
      stock_quantity: 0, // Default to 0 for number inputs
      category: "bagged",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setImageError("Only image files are allowed.");
        setImageFile(null);
        e.target.value = ""; // Clear the input
      } else if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setImageError("Image file size must be less than 5MB.");
        setImageFile(null);
        e.target.value = ""; // Clear the input
      } else {
        setImageFile(file);
        setImageError(null);
      }
    } else {
      setImageFile(null);
      setImageError("Image is required.");
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setImageError(null); // Clear previous image errors

    if (!imageFile) {
      setImageError("Product image is required.");
      setIsSubmitting(false);
      return;
    }

    let imageUrl = "";

    try {
      // 1. Upload image
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`; // Add random string for uniqueness

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message);

        setIsSubmitting(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);
      imageUrl = publicData.publicUrl;

      const { error: insertError } = await supabase.from("products").insert({
        name: data.name,
        description: data.description,
        price: data.price,
        unit: data.unit,
        stock_quantity: data.stock_quantity,
        category: data.category,
        image_url: imageUrl,
      });

      if (insertError) {
        toast.error("Product insert failed: " + insertError.message);
      } else {
        toast.success("Product added successfully!");
        router.push("/Products");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/Dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/Products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>New Product</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <div className="flex items-center gap-2">
            <Link href="/Products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Enter the basic details of the cement product.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., YTL Bagged Cement 50kg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The full name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bagged">Bagged</SelectItem>
                          <SelectItem value="bulk">Bulk</SelectItem>
                          <SelectItem value="ready-mix">Ready-Mix</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of cement product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (RM) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 18.50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Price per unit of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="per bag">Per Bag</SelectItem>
                          <SelectItem value="per tonne">Per Tonne</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The unit of measurement for pricing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 120"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Current quantity in stock.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="High-strength bagged cement suitable for general construction."
                          className="resize-none"
                          {...field}
                          value={field.value || ""} // Ensure controlled component
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>
                Upload an image for the product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormItem>
                <FormLabel>Image File *</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </FormControl>
                <FormDescription>
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB.
                </FormDescription>
                {imageError && <FormMessage>{imageError}</FormMessage>}
              </FormItem>
              {imageFile && (
                <div className="mt-4">
                  <Image
                    src={URL.createObjectURL(imageFile) || "/placeholder.svg"}
                    alt="Preview"
                    className="object-cover rounded-md"
                    width={128}
                    height={128}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/Products">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
