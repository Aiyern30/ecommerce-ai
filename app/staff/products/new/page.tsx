/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/";
import { TypographyH1 } from "@/components/ui/Typography";
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

  const MAX_IMAGES = 4;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const currentCount = selectedImageFiles.length;
    const totalSelected = currentCount + files.length;

    if (totalSelected > MAX_IMAGES) {
      setImageError(`You can only upload up to ${MAX_IMAGES} images.`);
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

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setImageError(null);

    if (selectedImageFiles.length === 0) {
      setImageError("At least one product image is required.");
      setIsSubmitting(false);
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
            price: data.price,
            unit: data.unit,
            stock_quantity: data.stock_quantity,
            category: data.category,
            grade: data.grade || null,
            image_url: selectedImageFiles.length > 0 ? "" : null,
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

      toast.success("Product added successfully!");
      router.push("/staff/products");
    } catch (error) {
      console.error("Unexpected error during product creation:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <TypographyH1>Add New Product</TypographyH1>
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
                          <SelectItem value="Concrete">Concrete</SelectItem>
                          <SelectItem value="Mortar">Mortar</SelectItem>
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
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., N20, M044, S35" {...field} />
                      </FormControl>
                      <FormDescription>
                        Product grade (e.g., N20 for concrete, M044 for mortar).
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
                        Base price per unit of the product.
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
                          <SelectItem value="per m³">Per m³</SelectItem>
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
                Upload one or more images for the product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormItem>
                <FormLabel>Image Files *</FormLabel>
                <FormDescription>
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB per file.
                </FormDescription>
                {imageError && <FormMessage>{imageError}</FormMessage>}
              </FormItem>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedImageFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square w-full border border-muted rounded-md overflow-hidden"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      fill
                      priority
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ))}

                {selectedImageFiles.length < MAX_IMAGES && (
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

          <Card>
            <CardHeader>
              <CardTitle>Product Tags</CardTitle>
              <CardDescription>Select or create relevant tags.</CardDescription>
            </CardHeader>
            <CardContent>
              <TagMultiSelect
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Certificates</CardTitle>
              <CardDescription>
                List any certifications the product holds (e.g., "ISO 9001",
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

          {/* NEW: Product Variants Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Add different pricing variants for delivery methods (e.g.,
                "Pump", "Tremie 1", "Tremie 2").
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
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
                <Button type="button" onClick={handleAddVariant}>
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
              {form.formState.errors.variants && (
                <FormMessage>
                  {form.formState.errors.variants.message}
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
              {isSubmitting ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
