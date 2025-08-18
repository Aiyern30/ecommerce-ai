"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, Plus, X, X as XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import * as z from "zod";
import {
  Button,
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
  AspectRatio,
  Checkbox,
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";

import Image from "next/image";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Skeleton } from "@/components/ui/";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  grade: z.string().min(1, "Grade is required"),
  product_type: z.enum(["concrete", "mortar"], {
    required_error: "Product type is required",
  }),
  mortar_ratio: z.string().optional(),
  category: z.string().default("building_materials"),
  normal_price: z.coerce
    .number()
    .min(0, "Price must be non-negative")
    .optional(),
  pump_price: z.coerce.number().min(0, "Price must be non-negative").optional(),
  tremie_1_price: z.coerce
    .number()
    .min(0, "Price must be non-negative")
    .optional(),
  tremie_2_price: z.coerce
    .number()
    .min(0, "Price must be non-negative")
    .optional(),
  tremie_3_price: z.coerce
    .number()
    .min(0, "Price must be non-negative")
    .optional(),
  unit: z.string().default("per m³"),
  stock_quantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be non-negative")
    .default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  is_featured: z.boolean().default(false),
  keywords: z.array(z.string()).default([]), // <-- add keywords to schema
});

type ProductFormData = z.infer<typeof productSchema>;

function ProductNewSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40 mb-2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - General Information Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
            {/* Product Type & Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            {/* Mortar Ratio */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Category & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            {/* Stock Quantity */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Featured */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-32" />
            </div>
            {/* Pricing Section */}
            <div className="space-y-4 pt-6 border-t">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Right Side - Upload Images Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-80" />
            </div>
            {/* Main Image */}
            <div className="mb-4">
              <Skeleton className="w-full aspect-[4/3] rounded-lg" />
            </div>
            {/* Additional Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Submit Buttons Skeleton */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Skeleton className="h-10 w-20" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      grade: "",
      product_type: "concrete",
      mortar_ratio: "",
      category: "building_materials",
      normal_price: undefined,
      pump_price: undefined,
      tremie_1_price: undefined,
      tremie_2_price: undefined,
      tremie_3_price: undefined,
      unit: "per m³",
      stock_quantity: 0,
      status: "draft",
      is_featured: false,
      keywords: [], // <-- add keywords default
    },
  });

  const watchProductType = form.watch("product_type");

  const MAX_IMAGES = 5; // 1 main image + 4 additional images

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const currentCount = selectedImageFiles.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (files.length > remainingSlots) {
      setImageError(
        `You can only upload ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        }. Maximum total: ${MAX_IMAGES} images (1 main + 4 additional).`
      );
      e.target.value = "";
      return;
    }

    const newFiles: File[] = [];
    let hasError = false;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setImageError(`File "${file.name}" is not an image.`);
        hasError = true;
      } else if (file.size > 5 * 1024 * 1024) {
        setImageError(`File "${file.name}" exceeds 5MB.`);
        hasError = true;
      } else {
        newFiles.push(file);
      }
    });

    if (hasError) {
      e.target.value = "";
      return;
    }

    setSelectedImageFiles((prev) => [...prev, ...newFiles]);
    setImageError(null);

    // Clear the input value to allow re-uploading the same file
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImageFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  // Add keyword to both local state and form
  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      const newKeywords = [...keywords, kw];
      setKeywords(newKeywords);
      form.setValue("keywords", newKeywords);
      setKeywordInput("");
    }
  };

  // Remove keyword from both local state and form
  const handleRemoveKeyword = (idx: number) => {
    const newKeywords = keywords.filter((_, i) => i !== idx);
    setKeywords(newKeywords);
    form.setValue("keywords", newKeywords);
  };

  useEffect(() => {
    setKeywords(form.getValues("keywords"));
  }, [form]);

  const handleSubmit = async (data: ProductFormData, isDraft = false) => {
    if (isDraft) {
      setIsDraftSaving(true);
    } else {
      setIsSubmitting(true);
    }
    setImageError(null);

    if (selectedImageFiles.length === 0 && !isDraft) {
      setImageError("At least one product image is required.");

      if (isDraft) {
        setIsDraftSaving(false);
      } else {
        setIsSubmitting(false);
      }

      return;
    }

    try {
      const imageUploads: string[] = [];

      // Upload all product images to Supabase Storage
      for (let i = 0; i < selectedImageFiles.length; i++) {
        const file = selectedImageFiles[i];
        const fileExt = file.name.split(".").pop();
        const filePath = `temp/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          toast.error(
            `Failed to upload image ${file.name}: ${uploadError.message}`
          );
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        imageUploads.push(publicData.publicUrl);
      }

      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: isDraft ? "draft" : "published",
          images: imageUploads,
          keywords, // <-- add keywords to payload
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error("Product creation failed: " + json.error);
        return;
      }

      toast.success(
        isDraft ? "Product saved as draft!" : "Product added successfully!"
      );
      router.push("/staff/products");
    } catch (error) {
      console.error("Unexpected error during product creation:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      if (isDraft) {
        setIsDraftSaving(false);
      } else {
        setIsSubmitting(false);
      }
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    await handleSubmit(data, false);
  };

  const onSaveDraft = async () => {
    const formData = form.getValues();
    // For drafts, we don't need to validate the form as strictly
    // Just ensure we have at least a name
    if (!formData.name.trim()) {
      toast.error("Product name is required even for drafts.");
      return;
    }
    await handleSubmit(formData, true);
  };

  if (isSubmitting || isDraftSaving) {
    return <ProductNewSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Products", href: "/staff/products" },
            { label: "New Product" },
          ]}
        />

        <div className="flex items-center justify-between">
          <TypographyH2 className="text-lg sm:text-2xl">
            Add New Product
          </TypographyH2>
          <div className="flex items-center gap-2">
            <Link href="/staff/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Products</span>
                <span className="inline sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Product Information - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - General Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>General Information</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Enter the basic details of the product.
                  </TypographyP>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Ready Mix Concrete Grade 30"
                          {...field}
                        />
                      </FormControl>
                      <div className="min-h-[10px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="High-quality concrete suitable for structural applications..."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="min-h-[10px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="product_type"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel>Product Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="concrete">Concrete</SelectItem>
                            <SelectItem value="mortar">Mortar</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Fixed height container for description */}
                        <div className="min-h-[32px]">
                          {/* Empty space to match the height of grade field description */}
                        </div>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              watchProductType === "concrete"
                                ? "e.g., N10, N15, N20, N25, N30"
                                : "e.g., M064, M054, M044, M034"
                            }
                            {...field}
                          />
                        </FormControl>
                        {/* Fixed height container for description */}
                        <div className="min-h-[32px]">
                          <FormDescription>
                            {watchProductType === "concrete"
                              ? "Concrete strength grade (N10, N15, etc.)"
                              : "Mortar mix designation (M064, M054, etc.)"}
                          </FormDescription>
                        </div>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {watchProductType === "mortar" && (
                  <FormField
                    control={form.control}
                    name="mortar_ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mortar Ratio</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1:3, 1:4, 1:6" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mix ratio for mortar (cement:sand)
                        </FormDescription>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="building_materials" {...field} />
                        </FormControl>
                        {/* Fixed height container for description - empty to match unit field */}
                        <div className="min-h-[32px]">{/* Empty space */}</div>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel>Unit</FormLabel>
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
                            <SelectItem value="per m³">Per m³</SelectItem>
                            <SelectItem value="per bag">Per Bag</SelectItem>
                            <SelectItem value="per tonne">Per Tonne</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Fixed height container for description - empty to match category field */}
                        <div className="min-h-[32px]">{/* Empty space */}</div>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 150"
                            {...field}
                          />
                        </FormControl>
                        <div className="min-h-[32px]">
                          <FormDescription>
                            Total cubic meters (m³) of this grade available in
                            inventory
                          </FormDescription>
                        </div>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full">
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="min-h-[32px]">{/* Empty space */}</div>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Keywords Input --- */}
                <FormField
                  control={form.control}
                  name="keywords"
                  render={() => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter keyword and press Enter"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddKeyword();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddKeyword}
                          disabled={!keywordInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {keywords.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No keywords added.
                          </span>
                        )}
                        {keywords.map((kw, idx) => (
                          <span
                            key={kw}
                            className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
                          >
                            {kw}
                            <button
                              type="button"
                              className="ml-1 text-blue-500 hover:text-blue-700"
                              onClick={() => handleRemoveKeyword(idx)}
                              aria-label={`Remove keyword ${kw}`}
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <FormDescription>
                        Add keywords to help categorize and search for this
                        product.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Product</FormLabel>
                        <FormDescription>
                          Mark this product as featured to highlight it on the
                          homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Pricing Section */}
                <div className="space-y-4 pt-6 border-t">
                  <div>
                    <TypographyH3>Delivery Method Pricing</TypographyH3>
                    <TypographyP className="!mt-0">
                      Set different prices based on concrete delivery and
                      placement methods. Leave blank for unavailable methods.
                    </TypographyP>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="normal_price"
                      render={({ field }) => (
                        <FormItem className="flex flex-col h-full">
                          <FormLabel>Normal Delivery (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 265.00"
                              {...field}
                            />
                          </FormControl>
                          {/* Fixed height container for description */}
                          <div className="min-h-[32px]">
                            <FormDescription>
                              Standard truck mixer delivery
                            </FormDescription>
                          </div>
                          <div className="min-h-[10px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pump_price"
                      render={({ field }) => (
                        <FormItem className="flex flex-col h-full">
                          <FormLabel>Pump Delivery (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 285.00"
                              {...field}
                            />
                          </FormControl>
                          {/* Fixed height container for description */}
                          <div className="min-h-[32px]">
                            <FormDescription>
                              Concrete pump truck delivery
                            </FormDescription>
                          </div>
                          <div className="min-h-[10px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tremie_1_price"
                      render={({ field }) => (
                        <FormItem className="flex flex-col h-full">
                          <FormLabel>Tremie Method 1 (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 290.00"
                              {...field}
                            />
                          </FormControl>
                          {/* Fixed height container for description */}
                          <div className="min-h-[32px]">
                            <FormDescription>
                              Underwater placement - shallow depth
                            </FormDescription>
                          </div>
                          <div className="min-h-[10px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tremie_2_price"
                      render={({ field }) => (
                        <FormItem className="flex flex-col h-full">
                          <FormLabel>Tremie Method 2 (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 310.00"
                              {...field}
                            />
                          </FormControl>
                          {/* Fixed height container for description */}
                          <div className="min-h-[32px]">
                            <FormDescription>
                              Underwater placement - medium depth
                            </FormDescription>
                          </div>
                          <div className="min-h-[10px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tremie_3_price"
                      render={({ field }) => (
                        <FormItem className="flex flex-col h-full">
                          <FormLabel>Tremie Method 3 (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 330.00"
                              {...field}
                            />
                          </FormControl>
                          {/* Fixed height container for description */}
                          <div className="min-h-[32px]">
                            <FormDescription>
                              Underwater placement - deep/complex
                            </FormDescription>
                          </div>
                          <div className="min-h-[10px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Add a helpful note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Pricing Guidelines:</p>
                        <ul className="space-y-1 text-xs">
                          <li>
                            • Normal delivery: Base price for standard truck
                            delivery
                          </li>
                          <li>
                            • Pump delivery: Higher cost due to pump equipment
                            required
                          </li>
                          <li>
                            • Tremie methods: Specialized underwater placement,
                            increasing cost with complexity
                          </li>
                          <li>
                            • Leave fields blank if delivery method is not
                            available for this grade
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Upload Images */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
                <CardDescription>
                  Upload one or more images for the product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Image Files *</FormLabel>
                  <FormDescription>
                    Upload 1 main image and up to 4 additional images. Accepted
                    formats: JPG, PNG, GIF. Max size: 5MB per file.
                  </FormDescription>
                  <div className="min-h-[10px]">
                    {imageError && <FormMessage>{imageError}</FormMessage>}
                  </div>
                </FormItem>

                <div className="mt-4">
                  {/* Main Image Display - Always show upload area */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {selectedImageFiles.length > 0 ? (
                        <>
                          <Image
                            src={URL.createObjectURL(selectedImageFiles[0])}
                            alt="Main product image"
                            className="w-full h-full object-cover"
                            fill
                            priority
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                            onClick={() => handleRemoveImage(0)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {/* Change main image overlay */}
                          <label
                            htmlFor="main-image-upload"
                            className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <div className="bg-white/90 hover:bg-white text-gray-700 px-3 py-2 rounded-md opacity-0 hover:opacity-100 transition-opacity">
                              Change Image
                            </div>
                          </label>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      ) : (
                        <label
                          htmlFor="main-image-upload"
                          className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-input/80 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                              <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                Upload main product image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Click to browse files
                              </p>
                            </div>
                          </div>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </label>
                      )}
                    </div>
                  </AspectRatio>

                  {/* Additional Images Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Additional Images</h4>
                      <span className="text-xs text-muted-foreground">
                        {Math.max(0, selectedImageFiles.length - 1)} of 4
                        uploaded
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {/* Additional uploaded images */}
                      {selectedImageFiles.slice(1).map((file, index) => (
                        <AspectRatio key={index + 1} ratio={1}>
                          <div className="relative group w-full h-full border border-muted rounded-md overflow-hidden">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Additional image ${index + 1}`}
                              className="w-full h-full object-cover"
                              fill
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                              onClick={() => handleRemoveImage(index + 1)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </AspectRatio>
                      ))}

                      {/* Empty slots for additional images */}
                      {Array.from(
                        {
                          length: Math.max(
                            0,
                            4 - Math.max(0, selectedImageFiles.length - 1)
                          ),
                        },
                        (_, index) => {
                          const currentAdditionalImages = Math.max(
                            0,
                            selectedImageFiles.length - 1
                          );
                          const slotIndex = currentAdditionalImages + index;
                          return (
                            <AspectRatio key={`empty-${index}`} ratio={1}>
                              <div className="relative w-full h-full border-2 border-dashed border-muted rounded-md bg-input hover:bg-input/80 transition-colors cursor-pointer">
                                <label
                                  htmlFor={`additional-image-upload-${slotIndex}`}
                                  className="flex items-center justify-center w-full h-full cursor-pointer"
                                >
                                  <Plus className="h-6 w-6 text-muted-foreground" />
                                  <span className="sr-only">
                                    Add additional image
                                  </span>
                                </label>
                                <input
                                  id={`additional-image-upload-${slotIndex}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            </AspectRatio>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-between items-center pt-6 border-t">
            <Link href="/staff/products">
              <Button variant="outline" type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <div className="flex gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting || isDraftSaving}
              >
                {isDraftSaving ? "Saving Draft..." : "Save Draft"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
