/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
  Badge,
} from "@/components/ui/";
import Image from "next/image";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().nullish(),
  price: z.coerce.number().min(0.01, "Price must be positive"),
  unit: z.enum(["per bag", "per tonne"], {
    required_error: "Unit is required",
  }),
  stock_quantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be non-negative"),
  category: z.enum(["bagged", "bulk", "ready-mix"], {
    required_error: "Category is required",
  }),
  tags: z
    .array(z.object({ tag: z.string().min(1, "Tag cannot be empty") }))
    .optional(),
  certificates: z
    .array(
      z.object({
        certificate: z.string().min(1, "Certificate cannot be empty"),
      })
    )
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ExistingImage {
  id: string;
  image_url: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [certificateInput, setCertificateInput] = useState("");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: null,
      price: 0,
      unit: "per bag",
      stock_quantity: 0,
      category: "bagged",
      tags: [],
      certificates: [],
    },
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
    replace: replaceTags,
  } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
    replace: replaceCertificates,
  } = useFieldArray({
    control: form.control,
    name: "certificates",
  });

  const MAX_IMAGES = 4;

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      try {
        setIsLoading(true);

        // Fetch product details
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (productError) {
          toast.error("Failed to fetch product: " + productError.message);
          router.push("/staff/products");
          return;
        }

        // Fetch product images
        const { data: images, error: imagesError } = await supabase
          .from("product_images")
          .select("id, image_url")
          .eq("product_id", productId);

        if (imagesError) {
          console.error("Failed to fetch product images:", imagesError.message);
        } else if (images) {
          setExistingImages(images);
        }

        // Fetch product tags
        const { data: tags, error: tagsError } = await supabase
          .from("product_tags")
          .select("tag")
          .eq("product_id", productId);

        if (tagsError) {
          console.error("Failed to fetch product tags:", tagsError.message);
        }

        // Fetch product certificates
        const { data: certificates, error: certificatesError } = await supabase
          .from("product_certificates")
          .select("certificate")
          .eq("product_id", productId);

        if (certificatesError) {
          console.error(
            "Failed to fetch product certificates:",
            certificatesError.message
          );
        }

        // Populate form with fetched data
        form.reset({
          name: product.name,
          description: product.description,
          price: product.price,
          unit: product.unit as "per bag" | "per tonne",
          stock_quantity: product.stock_quantity,
          category: product.category as "bagged" | "bulk" | "ready-mix",
          tags: tags?.map((t) => ({ tag: t.tag })) || [],
          certificates:
            certificates?.map((c) => ({ certificate: c.certificate })) || [],
        });

        // Replace field arrays with fetched data
        if (tags) {
          replaceTags(tags.map((t) => ({ tag: t.tag })));
        }
        if (certificates) {
          replaceCertificates(
            certificates.map((c) => ({ certificate: c.certificate }))
          );
        }
      } catch (error) {
        console.error("Unexpected error fetching product:", error);
        toast.error(
          "An unexpected error occurred while fetching product data."
        );
        router.push("/staff/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId, form, router, replaceTags, replaceCertificates]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const currentCount =
      selectedImageFiles.length + existingImages.length - imagesToDelete.length;
    const totalSelected = currentCount + files.length;

    if (totalSelected > MAX_IMAGES) {
      setImageError(`You can only have up to ${MAX_IMAGES} images total.`);
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
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedImageFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const handleRestoreExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tagFields.some((t) => t.tag === tagInput.trim())) {
      appendTag({ tag: tagInput.trim() });
      setTagInput("");
    }
  };

  const handleAddCertificate = () => {
    if (
      certificateInput.trim() &&
      !certificateFields.some((c) => c.certificate === certificateInput.trim())
    ) {
      appendCertificate({ certificate: certificateInput.trim() });
      setCertificateInput("");
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setImageError(null);

    const remainingExistingImages = existingImages.filter(
      (img) => !imagesToDelete.includes(img.id)
    );
    const totalImageCount =
      remainingExistingImages.length + selectedImageFiles.length;

    if (totalImageCount === 0) {
      setImageError("At least one product image is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Update main product data
      const { error: productUpdateError } = await supabase
        .from("products")
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          unit: data.unit,
          stock_quantity: data.stock_quantity,
          category: data.category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (productUpdateError) {
        toast.error("Product update failed: " + productUpdateError.message);
        setIsSubmitting(false);
        return;
      }

      // 2. Delete marked existing images
      if (imagesToDelete.length > 0) {
        // Delete from storage
        const imagesToDeleteData = existingImages.filter((img) =>
          imagesToDelete.includes(img.id)
        );

        for (const img of imagesToDeleteData) {
          // Extract file path from URL
          const url = new URL(img.image_url);
          const filePath = url.pathname.split("/").slice(-2).join("/"); // Get last two parts

          const { error: storageDeleteError } = await supabase.storage
            .from("products")
            .remove([filePath]);

          if (storageDeleteError) {
            console.error(
              "Failed to delete image from storage:",
              storageDeleteError.message
            );
          }
        }

        // Delete from database
        const { error: dbDeleteError } = await supabase
          .from("product_images")
          .delete()
          .in("id", imagesToDelete);

        if (dbDeleteError) {
          console.error(
            "Failed to delete images from database:",
            dbDeleteError.message
          );
          toast.error("Failed to delete some images: " + dbDeleteError.message);
        }
      }

      // 3. Upload new images
      const newImageUrls: { image_url: string }[] = [];
      for (const file of selectedImageFiles) {
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
          console.error(
            `Image upload failed for ${file.name}:`,
            uploadError.message
          );
          toast.error(
            `Failed to upload image ${file.name}: ${uploadError.message}`
          );
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        newImageUrls.push({ image_url: publicData.publicUrl });
      }

      // 4. Insert new images into database
      if (newImageUrls.length > 0) {
        const { error: imagesInsertError } = await supabase
          .from("product_images")
          .insert(
            newImageUrls.map((url) => ({
              product_id: productId,
              image_url: url.image_url,
            }))
          );

        if (imagesInsertError) {
          console.error(
            "Product images insert failed:",
            imagesInsertError.message
          );
          toast.error(
            "Failed to link new product images: " + imagesInsertError.message
          );
        }
      }

      // 5. Update main product image_url if needed
      const allCurrentImages = [
        ...remainingExistingImages.map((img) => img.image_url),
        ...newImageUrls.map((img) => img.image_url),
      ];

      if (allCurrentImages.length > 0) {
        const { error: updateMainImageError } = await supabase
          .from("products")
          .update({ image_url: allCurrentImages[0] })
          .eq("id", productId);

        if (updateMainImageError) {
          console.error(
            "Failed to update main product image_url:",
            updateMainImageError.message
          );
        }
      }

      // 6. Update tags - delete all existing and insert new ones
      const { error: deleteTagsError } = await supabase
        .from("product_tags")
        .delete()
        .eq("product_id", productId);

      if (deleteTagsError) {
        console.error(
          "Failed to delete existing tags:",
          deleteTagsError.message
        );
      }

      if (data.tags && data.tags.length > 0) {
        const tagsToInsert = data.tags.map((item) => ({
          product_id: productId,
          tag: item.tag,
        }));
        const { error: tagsInsertError } = await supabase
          .from("product_tags")
          .insert(tagsToInsert);

        if (tagsInsertError) {
          console.error("Product tags insert failed:", tagsInsertError.message);
          toast.error(
            "Failed to update product tags: " + tagsInsertError.message
          );
        }
      }

      // 7. Update certificates - delete all existing and insert new ones
      const { error: deleteCertificatesError } = await supabase
        .from("product_certificates")
        .delete()
        .eq("product_id", productId);

      if (deleteCertificatesError) {
        console.error(
          "Failed to delete existing certificates:",
          deleteCertificatesError.message
        );
      }

      if (data.certificates && data.certificates.length > 0) {
        const certificatesToInsert = data.certificates.map((item) => ({
          product_id: productId,
          certificate: item.certificate,
        }));
        const { error: certificatesInsertError } = await supabase
          .from("product_certificates")
          .insert(certificatesToInsert);

        if (certificatesInsertError) {
          console.error(
            "Product certificates insert failed:",
            certificatesInsertError.message
          );
          toast.error(
            "Failed to update product certificates: " +
              certificatesInsertError.message
          );
        }
      }

      toast.success("Product updated successfully!");
      router.push("/staff/products");
    } catch (error) {
      console.error("Unexpected error during product update:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading product data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Edit Product</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <div className="flex items-center gap-2">
            <Link href="/staff/products">
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
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Update the basic details of the cement product.
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
                        value={field.value}
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
                        value={field.value}
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
                          value={field.value || ""}
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

          {/* Multiple Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Manage product images. You can add new images or remove existing
                ones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormItem>
                <FormLabel>Image Files *</FormLabel>
                <FormDescription>
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB per file.
                  Maximum {MAX_IMAGES} images total.
                </FormDescription>
                {imageError && <FormMessage>{imageError}</FormMessage>}
              </FormItem>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group aspect-square w-full border rounded-md overflow-hidden ${
                      imagesToDelete.includes(image.id)
                        ? "border-destructive opacity-50"
                        : "border-muted"
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt="Product image"
                      className="w-full h-full object-cover"
                      fill
                      priority
                    />
                    {imagesToDelete.includes(image.id) ? (
                      <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRestoreExistingImage(image.id)}
                        >
                          Restore
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveExistingImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    )}
                  </div>
                ))}

                {/* New Images */}
                {selectedImageFiles.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group aspect-square w-full border border-muted rounded-md overflow-hidden"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`New preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      fill
                      priority
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                    <Badge className="absolute bottom-1 left-1 text-xs">
                      New
                    </Badge>
                  </div>
                ))}

                {/* Add More Images Button */}
                {selectedImageFiles.length +
                  existingImages.length -
                  imagesToDelete.length <
                  MAX_IMAGES && (
                  <div className="relative flex items-center justify-center border border-dashed border-muted rounded-md aspect-square w-full cursor-pointer hover:bg-muted transition">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                    >
                      <span className="text-4xl font-bold text-muted-foreground">
                        +
                      </span>
                      <span className="sr-only">Add more images</span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Product Tags</CardTitle>
              <CardDescription>
                Manage relevant tags to categorize the product (e.g.,
                "construction", "eco-friendly").
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagFields.map((item, index) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {item.tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => removeTag(index)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove tag</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              {form.formState.errors.tags && (
                <FormMessage>{form.formState.errors.tags.message}</FormMessage>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Certificates</CardTitle>
              <CardDescription>
                Manage certifications the product holds (e.g., "ISO 9001",
                "Green Mark").
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a certificate"
                  value={certificateInput}
                  onChange={(e) => setCertificateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCertificate();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddCertificate}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {certificateFields.map((item, index) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {item.certificate}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => removeCertificate(index)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove certificate</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              {form.formState.errors.certificates && (
                <FormMessage>
                  {form.formState.errors.certificates.message}
                </FormMessage>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/staff/products">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating Product..." : "Update Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
