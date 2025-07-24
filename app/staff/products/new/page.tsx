/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  Badge,
  AspectRatio,
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
  status: z.enum(["draft", "published"]).optional(),
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

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
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
      status: "draft",
      tags: [],
      certificates: [],
      variants: [],
    },
  });

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({
    control: form.control,
    name: "certificates",
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

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
    if (selectedImageFiles.length === 1) {
      setImageError("At least one product image is required.");
    } else if (selectedImageFiles.length === 0) {
      setImageError("At least one product image is required.");
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

  const handleSubmit = async (data: ProductFormData, isDraft = false) => {
    if (isDraft) {
      setIsDraftSaving(true);
    } else {
      setIsSubmitting(true);
    }
    setImageError(null);

    // For published products, require at least one image
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
      // 1. Insert main product data
      const { data: productInsertData, error: productInsertError } =
        await supabase
          .from("products")
          .insert({
            name: data.name,
            description: data.description,
            price: data.price || 0, // Default to 0 for drafts
            unit: data.unit,
            stock_quantity: data.stock_quantity || 0, // Default to 0 for drafts
            category: data.category,
            grade: data.grade || null,
            image_url: selectedImageFiles.length > 0 ? "" : null,
            status: isDraft ? "draft" : "published",
          })
          .select("id")
          .single();

      if (productInsertError) {
        toast.error("Product creation failed: " + productInsertError.message);
        setIsSubmitting(false);
        return;
      }

      const productId = productInsertData.id;

      // 2. Upload multiple images and insert into product_images table
      const imageUrls: { image_url: string }[] = [];
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
        imageUrls.push({ image_url: publicData.publicUrl });
      }

      if (imageUrls.length > 0) {
        const { error: imagesInsertError } = await supabase
          .from("product_images")
          .insert(
            imageUrls.map((url) => ({
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
            "Failed to link product images: " + imagesInsertError.message
          );
        } else {
          const { error: updateMainImageError } = await supabase
            .from("products")
            .update({ image_url: imageUrls[0].image_url })
            .eq("id", productId);

          if (updateMainImageError) {
            console.error(
              "Failed to update main product image_url:",
              updateMainImageError.message
            );
            toast.error(
              "Failed to set main product image: " +
                updateMainImageError.message
            );
          }
        }
      }

      // 3. Insert product tags
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
          toast.error("Failed to add product tags: " + tagsInsertError.message);
        }
      }

      // 4. Insert product certificates
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
            "Failed to add product certificates: " +
              certificatesInsertError.message
          );
        }
      }

      // 5. Insert product variants
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
            "Failed to add product variants: " + variantsInsertError.message
          );
        }
      }

      if (isDraft) {
        toast.success("Product saved as draft successfully!");
      } else {
        toast.success("Product added successfully!");
      }
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
          <TypographyH2>Add New Product</TypographyH2>
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
                    Enter the basic details of the cement product.
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
                      Add tags, certificates, and product variants for this
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
                        Add any certifications the product holds (e.g., "ISO
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
              <Button
                variant="outline"
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting || isDraftSaving}
              >
                {isDraftSaving ? "Saving Draft..." : "Save Draft"}
              </Button>
              <Button type="submit" disabled={isSubmitting || isDraftSaving}>
                {isSubmitting ? "Publishing Product..." : "Publish Product"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
