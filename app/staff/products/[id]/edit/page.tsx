/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, Plus, X, Package, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
  Badge,
  Skeleton,
  AspectRatio,
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import Image from "next/image";
import { toast } from "sonner";
import TagMultiSelect from "@/components/TagMultiSelect";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().nullish(),
  price: z.coerce.number().min(0.01, "Price must be positive"),
  unit: z.enum(["per bag", "per tonne", "per m³"], {
    required_error: "Unit is required",
  }),
  stock_quantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be non-negative"),
  category: z.enum(["bagged", "bulk", "ready-mix", "Concrete", "Mortar"], {
    required_error: "Category is required",
  }),
  // NEW FIELDS
  grade: z.string().optional(),
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
  // NEW: Product variants for different pricing tiers
  variants: z
    .array(
      z.object({
        variant_type: z.string().min(1, "Variant type is required"),
        price: z.coerce.number().min(0.01, "Variant price must be positive"),
      })
    )
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ExistingImage {
  id: string;
  image_url: string;
}

// Product Edit Skeleton Component
function ProductEditSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      {/* Product Details Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-48" />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-44" />
          </div>

          {/* Grade Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-60" />
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>

          {/* Unit Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-52" />
          </div>

          {/* Stock Quantity Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-44" />
          </div>

          {/* Description Field */}
          <div className="md:col-span-2 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-3 w-56" />
          </div>
        </CardContent>
      </Card>

      {/* Product Images Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-80" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Tags Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Certificates Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-68" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Variants Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-76" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons Skeleton */}
      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

// Product Not Found Component
function ProductNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <span>/</span>
          <span>Products</span>
          <span>/</span>
          <span>Not Found</span>
          <span>/</span>
          <span>Edit</span>
        </div>

        <div className="flex items-center justify-between">
          <TypographyH2>Product Not Found</TypographyH2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/staff/products")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>

      {/* Not Found Content */}
      <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[500px]">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>

        <TypographyH2 className="mb-2">Product Not Found</TypographyH2>

        <TypographyP className="text-muted-foreground text-center mb-2 max-w-md">
          The product you&apos;re trying to edit doesn&apos;t exist or may have
          been removed.
        </TypographyP>

        <TypographyP className="text-sm text-muted-foreground text-center mb-8 max-w-md">
          Please check the URL or try searching for the product again.
        </TypographyP>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push("/staff/products")}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-md">
          <TypographyP className="text-center text-sm text-muted-foreground mb-4">
            Need to create a new product?
          </TypographyP>
          <Button
            variant="default"
            onClick={() => router.push("/staff/products/new")}
            className="w-full flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Create New Product
          </Button>
        </div>
      </div>
    </div>
  );
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
  const [certificateInput, setCertificateInput] = useState("");
  const [variantTypeInput, setVariantTypeInput] = useState("");
  const [variantPriceInput, setVariantPriceInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<
    { id: string; name: string }[]
  >([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: null,
      price: 0,
      unit: "per bag",
      stock_quantity: 0,
      category: "bagged",
      grade: "",
      tags: [],
      certificates: [],
      variants: [],
    },
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

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    replace: replaceVariants,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      try {
        setIsLoading(true);

        // Fetch product details
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("*, product_tags:product_tags(tag_id, tags(id, name))")
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

        const { error: tagError } = await supabase
          .from("product_tags")
          .select("tags(id, name)")
          .eq("product_id", productId);

        if (tagError) {
          console.error("Failed to fetch product tags:", tagError.message);
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

        // Fetch product variants
        const { data: variants, error: variantsError } = await supabase
          .from("product_variants")
          .select("variant_type, price")
          .eq("product_id", productId);

        if (variantsError) {
          console.error(
            "Failed to fetch product variants:",
            variantsError.message
          );
        }

        const productTags = (product.product_tags ?? []) as {
          tags: { id: string; name: string };
        }[];

        // Set selectedTags for TagMultiSelect component
        setSelectedTags(
          productTags.map((pt) => ({
            id: pt.tags.id,
            name: pt.tags.name,
          }))
        );

        form.reset({
          name: product.name,
          description: product.description,
          price: product.price,
          unit: product.unit as "per bag" | "per tonne" | "per m³",
          stock_quantity: product.stock_quantity,
          category: product.category as
            | "bagged"
            | "bulk"
            | "ready-mix"
            | "Concrete"
            | "Mortar",
          grade: product.grade || "",
          tags: productTags.map((pt) => ({
            tag: pt.tags.name,
          })),
          certificates:
            certificates?.map((c) => ({ certificate: c.certificate })) || [],
          variants:
            variants?.map((v) => ({
              variant_type: v.variant_type,
              price: v.price,
            })) || [],
        });

        if (certificates) {
          replaceCertificates(
            certificates.map((c) => ({ certificate: c.certificate }))
          );
        }

        if (variants) {
          replaceVariants(
            variants.map((v) => ({
              variant_type: v.variant_type,
              price: v.price,
            }))
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
  }, [productId, form, router, replaceCertificates, replaceVariants]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const currentCount =
      selectedImageFiles.length + existingImages.length - imagesToDelete.length;
    const totalSelected = currentCount + files.length;

    if (totalSelected > 5) {
      setImageError(`You can only have up to 5 images total (1 main + 4 additional).`);
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

  const handleRemoveImage = (index: number) => {
    setSelectedImageFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
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

  const handleAddVariant = () => {
    if (
      variantTypeInput.trim() &&
      variantPriceInput.trim() &&
      !variantFields.some((v) => v.variant_type === variantTypeInput.trim())
    ) {
      appendVariant({
        variant_type: variantTypeInput.trim(),
        price: parseFloat(variantPriceInput),
      });
      setVariantTypeInput("");
      setVariantPriceInput("");
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
          grade: data.grade || null,
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

      if (selectedTags && selectedTags.length > 0) {
        const tagsToInsert = selectedTags.map((tag) => ({
          product_id: productId,
          tag_id: tag.id,
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

      // 8. Update variants - delete all existing and insert new ones
      const { error: deleteVariantsError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      if (deleteVariantsError) {
        console.error(
          "Failed to delete existing variants:",
          deleteVariantsError.message
        );
      }

      if (data.variants && data.variants.length > 0) {
        const variantsToInsert = data.variants.map((item) => ({
          product_id: productId,
          variant_type: item.variant_type,
          price: item.price,
        }));
        const { error: variantsInsertError } = await supabase
          .from("product_variants")
          .insert(variantsToInsert);

        if (variantsInsertError) {
          console.error(
            "Product variants insert failed:",
            variantsInsertError.message
          );
          toast.error(
            "Failed to update product variants: " + variantsInsertError.message
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
    return <ProductEditSkeleton />;
  }

  // Check if product data was not found after loading
  if (
    !isLoading &&
    (!form.getValues("name") || form.getValues("name") === "")
  ) {
    return <ProductNotFound />;
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
          <TypographyH2>Edit Product</TypographyH2>
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
                    Edit the basic details of the cement product.
                  </TypographyP>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name Product</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., YTL Bagged Cement 50kg"
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
                      <FormLabel>Description Product</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="High-strength bagged cement suitable for general construction."
                          className="resize-none min-h-[100px]"
                          {...field}
                          value={field.value || ""}
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
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
                            <SelectItem value="Concrete">Concrete</SelectItem>
                            <SelectItem value="Mortar">Mortar</SelectItem>
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
                          <Input
                            placeholder="e.g., N20, M044, S35"
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

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Pricing And Stock</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Pricing</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 18.50"
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
                      name="stock_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 120"
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

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
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
                            <SelectItem value="per m³">Per m³</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Information Section */}
                <div className="space-y-6 pt-6 border-t">
                  <div>
                    <TypographyH3>Additional Information</TypographyH3>
                    <TypographyP className="!mt-0">
                      Edit tags, certificates, and product variants for this
                      product.
                    </TypographyP>
                  </div>

                  {/* Product Tags Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Product Tags</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select or create relevant tags for this product.
                      </p>
                    </div>
                    <TagMultiSelect
                      selectedTags={selectedTags}
                      setSelectedTags={setSelectedTags}
                    />
                  </div>

                  {/* Product Certificates Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Product Certificates
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Manage certifications the product holds (e.g., "ISO
                        9001", "Green Mark").
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCertificate}
                        variant="outline"
                      >
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
                    <div className="min-h-[10px]">
                      {form.formState.errors.certificates && (
                        <FormMessage>
                          {form.formState.errors.certificates.message}
                        </FormMessage>
                      )}
                    </div>
                  </div>

                  {/* Product Variants Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Product Variants
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add different pricing variants for delivery methods
                        (e.g., "Pump", "Tremie 1", "Tremie 2").
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Variant type (e.g., Pump)"
                        value={variantTypeInput}
                        onChange={(e) => setVariantTypeInput(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price (RM)"
                        value={variantPriceInput}
                        onChange={(e) => setVariantPriceInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddVariant}
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variantFields.map((item, index) => (
                        <Badge
                          key={item.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {item.variant_type} - RM {item.price}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => removeVariant(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove variant</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="min-h-[10px]">
                      {form.formState.errors.variants && (
                        <FormMessage>
                          {form.formState.errors.variants.message}
                        </FormMessage>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Upload Images */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>Upload Images</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Upload one or more images for the product.
                  </TypographyP>
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
                  {/* Main Image Display - Handle both new and existing images */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {/* Show main image - prioritize new files first, then existing */}
                      {(() => {
                        // Get all available images (new + existing not marked for deletion)
                        const availableExisting = existingImages.filter(
                          (img) => !imagesToDelete.includes(img.id)
                        );
                        const allImages = [...selectedImageFiles, ...availableExisting];
                        const mainImage = allImages[0];

                        if (mainImage) {
                          const isNewFile = selectedImageFiles.includes(mainImage as File);
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
                                  if (isNewFile) {
                                    handleRemoveImage(0);
                                  } else {
                                    handleRemoveExistingImage((mainImage as ExistingImage).id);
                                  }
                                }}
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
                        const allImages = [...selectedImageFiles, ...availableExisting];
                        const additionalCount = Math.max(0, allImages.length - 1);
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
                        const allImages = [...selectedImageFiles, ...availableExisting];
                        const additionalImages = allImages.slice(1);

                        return additionalImages.map((image, index) => {
                          const isNewFile = selectedImageFiles.includes(image as File);
                          const imageSrc = isNewFile 
                            ? URL.createObjectURL(image as File)
                            : (image as ExistingImage).image_url;
                          const actualIndex = index + 1; // Actual index in the full array

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
                                    if (isNewFile) {
                                      handleRemoveImage(actualIndex);
                                    } else {
                                      handleRemoveExistingImage((image as ExistingImage).id);
                                    }
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
                        const allImages = [...selectedImageFiles, ...availableExisting];
                        const additionalCount = Math.max(0, allImages.length - 1);
                        const emptySlots = Math.max(0, 4 - additionalCount);

                        return Array.from({ length: emptySlots }, (_, index) => (
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
                        ));
                      })()}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Upload up to 4 additional images. Accepted formats: JPG,
                      PNG, GIF. Max size: 5MB per file.
                    </p>
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
              <Button variant="outline" type="button">
                Save Draft
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating Product..." : "Update Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
