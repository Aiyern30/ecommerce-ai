"use client";
import Link from "next/link";
import type React from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
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
  Skeleton,
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import TagMultiSelect from "@/components/TagMultiSelect";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import Image from "next/image";
import { toast } from "sonner";

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
});

type ProductFormData = z.infer<typeof productSchema>;

interface ExistingImage {
  id: string;
  image_url: string;
  is_primary?: boolean;
  sort_order?: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<
    { id: string; name: string }[]
  >([]);

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
    },
  });

  const watchProductType = form.watch("product_type");
  const MAX_IMAGES = 5;

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      // Fetch product main data
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        toast.error("Product not found.");
        router.push("/staff/products");
        return;
      }

      // Fetch images
      const { data: images } = await supabase
        .from("product_images")
        .select("id, image_url, is_primary, sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      setExistingImages(images || []);

      // Fetch tags
      const { data: tagLinks } = await supabase
        .from("product_tags")
        .select("tag_id, tags(name)")
        .eq("product_id", productId);

      setSelectedTags(
        (tagLinks || []).map((t) => {
          let tagName = "";
          if (
            Array.isArray(t.tags) &&
            t.tags.length > 0 &&
            typeof t.tags[0].name === "string"
          ) {
            tagName = t.tags[0].name;
          } else if (
            t.tags &&
            typeof t.tags === "object" &&
            "name" in t.tags &&
            typeof t.tags.name === "string"
          ) {
            tagName = t.tags.name;
          }
          return {
            id: String(t.tag_id),
            name: tagName,
          };
        })
      );

      // Set form values
      form.reset({
        name: product.name || "",
        description: product.description || "",
        grade: product.grade || "",
        product_type: product.product_type || "concrete",
        mortar_ratio: product.mortar_ratio || "",
        category: product.category || "building_materials",
        normal_price: product.normal_price ?? undefined,
        pump_price: product.pump_price ?? undefined,
        tremie_1_price: product.tremie_1_price ?? undefined,
        tremie_2_price: product.tremie_2_price ?? undefined,
        tremie_3_price: product.tremie_3_price ?? undefined,
        unit: product.unit || "per m³",
        stock_quantity: product.stock_quantity ?? 0,
        status: product.status || "draft",
        is_featured: product.is_featured ?? false,
      });

      setIsLoading(false);
    };
    fetchProduct();
    // eslint-disable-next-line
  }, [productId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const currentCount =
      selectedImageFiles.length + existingImages.length - imagesToDelete.length;
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
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImageFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const handleSubmit = async (data: ProductFormData, isDraft = false) => {
    if (isDraft) setIsDraftSaving(true);
    else setIsSubmitting(true);
    setImageError(null);

    const remainingExistingImages = existingImages.filter(
      (img) => !imagesToDelete.includes(img.id)
    );
    const totalImageCount =
      remainingExistingImages.length + selectedImageFiles.length;

    if (totalImageCount === 0 && !isDraft) {
      setImageError("At least one product image is required.");
      if (isDraft) setIsDraftSaving(false);
      else setIsSubmitting(false);
      return;
    }

    try {
      // 1. Update main product data
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: data.name,
          description: data.description || null,
          grade: data.grade,
          product_type: data.product_type,
          mortar_ratio:
            data.product_type === "mortar" ? data.mortar_ratio || null : null,
          category: data.category,
          normal_price: data.normal_price || null,
          pump_price: data.pump_price || null,
          tremie_1_price: data.tremie_1_price || null,
          tremie_2_price: data.tremie_2_price || null,
          tremie_3_price: data.tremie_3_price || null,
          unit: data.unit,
          stock_quantity: data.stock_quantity,
          status: isDraft ? "draft" : "published",
          is_featured: data.is_featured,
        })
        .eq("id", productId);

      if (updateError) {
        toast.error("Product update failed: " + updateError.message);
        if (isDraft) setIsDraftSaving(false);
        else setIsSubmitting(false);
        return;
      }

      // 2. Delete marked images
      if (imagesToDelete.length > 0) {
        const { error: dbDeleteError } = await supabase
          .from("product_images")
          .delete()
          .in("id", imagesToDelete);
        if (dbDeleteError) {
          toast.error("Failed to delete some images: " + dbDeleteError.message);
        }
      }

      // 3. Upload new images
      const newImageInserts: {
        product_id: string;
        image_url: string;
        is_primary: boolean;
        sort_order: number;
      }[] = [];
      for (let i = 0; i < selectedImageFiles.length; i++) {
        const file = selectedImageFiles[i];
        const fileExt = file.name.split(".").pop();
        const filePath = `${productId}/${Date.now()}-${Math.random()
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
        newImageInserts.push({
          product_id: productId,
          image_url: publicData.publicUrl,
          is_primary: false,
          sort_order: remainingExistingImages.length + i,
        });
      }
      if (newImageInserts.length > 0) {
        const { error: imagesInsertError } = await supabase
          .from("product_images")
          .insert(newImageInserts);
        if (imagesInsertError) {
          toast.error(
            "Failed to link product images: " + imagesInsertError.message
          );
        }
      }

      // 4. Reorder and set primary image
      // Get all current images (remaining + new)
      const allCurrentImages = [
        ...remainingExistingImages,
        ...newImageInserts.map((img) => ({
          id: "", // not needed for update
          image_url: img.image_url,
          is_primary: false,
          sort_order: img.sort_order,
        })),
      ];
      // Set first image as primary
      if (allCurrentImages.length > 0) {
        const mainImageUrl = allCurrentImages[0].image_url;
        await supabase
          .from("products")
          .update({ image_url: mainImageUrl })
          .eq("id", productId);
        // Update product_images table
        for (let i = 0; i < allCurrentImages.length; i++) {
          const img = allCurrentImages[i];
          if (img.id) {
            await supabase
              .from("product_images")
              .update({ is_primary: i === 0, sort_order: i })
              .eq("id", img.id);
          }
        }
      }

      // 5. Update tags
      await supabase.from("product_tags").delete().eq("product_id", productId);
      if (selectedTags && selectedTags.length > 0) {
        const tagsToInsert = selectedTags.map((tag) => ({
          product_id: productId,
          tag_id: tag.id,
        }));
        await supabase.from("product_tags").insert(tagsToInsert);
      }

      if (isDraft) toast.success("Product saved as draft successfully!");
      else toast.success("Product updated successfully!");
      router.push("/staff/products");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      if (isDraft) setIsDraftSaving(false);
      else setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    await handleSubmit(data, false);
  };

  const onSaveDraft = async () => {
    const formData = form.getValues();
    if (!formData.name.trim()) {
      toast.error("Product name is required even for drafts.");
      return;
    }
    await handleSubmit(formData, true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-full">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[600px] w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Products", href: "/staff/products" },
            { label: "Edit Product" },
          ]}
        />
        <div className="flex items-center justify-between">
          <TypographyH2 className="text-lg sm:text-2xl">
            Edit Product
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - General Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>General Information</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Edit the basic details of the product.
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="product_type"
                    render={({ field }) => (
                      <FormItem>
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
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 30, 25, 20" {...field} />
                        </FormControl>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="building_materials" {...field} />
                        </FormControl>
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
                      <FormItem>
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
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 100"
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
                    <TypographyH3>Pricing Tiers</TypographyH3>
                    <TypographyP className="!mt-0">
                      Set different prices for various delivery methods.
                    </TypographyP>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="normal_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Normal Price (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 150.00"
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
                      name="pump_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pump Price (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 170.00"
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
                      name="tremie_1_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tremie 1 Price (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 180.00"
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
                      name="tremie_2_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tremie 2 Price (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 190.00"
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
                      name="tremie_3_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tremie 3 Price (RM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 200.00"
                              {...field}
                            />
                          </FormControl>
                          <div className="min-h-[10px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Tags Section */}
                <div className="space-y-4 pt-6 border-t">
                  <div>
                    <TypographyH3>Product Tags</TypographyH3>
                    <TypographyP className="!mt-0">
                      Add relevant tags to help customers find this product.
                    </TypographyP>
                  </div>
                  <TagMultiSelect
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                  />
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
                  {/* Main Image Display */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {(() => {
                        // Get all available images (new + existing not marked for deletion)
                        const availableExisting = existingImages.filter(
                          (img) => !imagesToDelete.includes(img.id)
                        );
                        const allImages = [
                          ...selectedImageFiles,
                          ...availableExisting,
                        ];
                        const mainImage = allImages[0];
                        if (mainImage) {
                          const isNewFile = selectedImageFiles.includes(
                            mainImage as File
                          );
                          const imageSrc = isNewFile
                            ? URL.createObjectURL(mainImage as File)
                            : (mainImage as ExistingImage).image_url;
                          return (
                            <>
                              <Image
                                src={imageSrc}
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
                                onClick={() => {
                                  if (isNewFile) handleRemoveImage(0);
                                  else
                                    handleRemoveExistingImage(
                                      (mainImage as ExistingImage).id
                                    );
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
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
                          );
                        } else {
                          return (
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
                          );
                        }
                      })()}
                    </div>
                  </AspectRatio>
                  {/* Additional Images Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Additional Images</h4>
                      {(() => {
                        const availableExisting = existingImages.filter(
                          (img) => !imagesToDelete.includes(img.id)
                        );
                        const allImages = [
                          ...selectedImageFiles,
                          ...availableExisting,
                        ];
                        const additionalCount = Math.max(
                          0,
                          allImages.length - 1
                        );
                        return (
                          <span className="text-xs text-muted-foreground">
                            {additionalCount} of 4 uploaded
                          </span>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {/* Additional images (skip the first one which is main) */}
                      {(() => {
                        const availableExisting = existingImages.filter(
                          (img) => !imagesToDelete.includes(img.id)
                        );
                        const allImages = [
                          ...selectedImageFiles,
                          ...availableExisting,
                        ];
                        const additionalImages = allImages.slice(1);
                        return additionalImages.map((image, index) => {
                          const isNewFile = selectedImageFiles.includes(
                            image as File
                          );
                          const imageSrc = isNewFile
                            ? URL.createObjectURL(image as File)
                            : (image as ExistingImage).image_url;
                          const actualIndex = index + 1;
                          return (
                            <AspectRatio key={`additional-${index}`} ratio={1}>
                              <div className="relative group w-full h-full border border-muted rounded-md overflow-hidden">
                                <Image
                                  src={imageSrc}
                                  alt={`Additional image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  fill
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                  onClick={() => {
                                    if (isNewFile)
                                      handleRemoveImage(actualIndex);
                                    else
                                      handleRemoveExistingImage(
                                        (image as ExistingImage).id
                                      );
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </AspectRatio>
                          );
                        });
                      })()}
                      {/* Empty slots for additional images */}
                      {(() => {
                        const availableExisting = existingImages.filter(
                          (img) => !imagesToDelete.includes(img.id)
                        );
                        const allImages = [
                          ...selectedImageFiles,
                          ...availableExisting,
                        ];
                        const additionalCount = Math.max(
                          0,
                          allImages.length - 1
                        );
                        const emptySlots = Math.max(0, 4 - additionalCount);
                        return Array.from(
                          { length: emptySlots },
                          (_, index) => (
                            <AspectRatio key={`empty-${index}`} ratio={1}>
                              <div className="relative w-full h-full border-2 border-dashed border-muted rounded-md bg-input hover:bg-input/80 transition-colors cursor-pointer">
                                <label
                                  htmlFor={`additional-image-upload-${index}`}
                                  className="flex items-center justify-center w-full h-full cursor-pointer"
                                >
                                  <Plus className="h-6 w-6 text-muted-foreground" />
                                  <span className="sr-only">
                                    Add additional image
                                  </span>
                                </label>
                                <input
                                  id={`additional-image-upload-${index}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            </AspectRatio>
                          )
                        );
                      })()}
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
              <Button type="submit" disabled={isSubmitting || isDraftSaving}>
                {isSubmitting ? "Updating Product..." : "Update Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
