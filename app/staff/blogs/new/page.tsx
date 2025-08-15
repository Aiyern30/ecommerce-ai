/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import type React from "react";
import rehypeSanitize from "rehype-sanitize";

import { ArrowLeft, X, Plus, ExternalLink, LinkIcon } from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import Image from "next/image";
import { toast } from "sonner";
import TagMultiSelect from "@/components/TagMultiSelect";
import dynamic from "next/dynamic";
import { useDeviceType } from "@/utils/useDeviceTypes";

// Dynamically import MDEditor (SSR false)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Zod schema for blog creation
const blogSchema = z.object({
  title: z
    .string()
    .min(1, "Blog title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .nullish(),
  link_name: z
    .string()
    .max(100, "Link name must be less than 100 characters")
    .nullish(),
  link: z.string().nullish().or(z.literal("")),
  linkType: z.enum(["internal", "external"]),
  content: z.string().min(1, "Content is required"),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function Page() {
  const router = useRouter();
  const { isMobile } = useDeviceType();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<
    { id: string; name: string }[]
  >([]);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      description: "",
      link_name: "",
      link: "",
      linkType: "internal",
      content: "",
    },
  });

  const MAX_IMAGES = 5; // 1 main + 4 additional

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
      } else if (file.size > 10 * 1024 * 1024) {
        setImageError(`File "${file.name}" exceeds 10MB.`);
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
      setImageError(null);
    }
  };

  const validateLink = (link: string, type: string) => {
    if (!link) return true; // Empty link is allowed

    if (type === "external") {
      return link.startsWith("http://") || link.startsWith("https://");
    } else {
      // Internal link should start with / and not be a full URL
      return link.startsWith("/") && !link.includes("://");
    }
  };

  const handleSubmit = async (data: BlogFormData, isDraft = false) => {
    if (isDraft) {
      setIsDraftSaving(true);
    } else {
      setIsSubmitting(true);
    }
    setImageError(null);

    // Validate link based on type
    if (data.link && !validateLink(data.link, data.linkType)) {
      if (data.linkType === "external") {
        toast.error("External links must start with http:// or https://");
      } else {
        toast.error("Internal links must start with / (e.g., /staff/products)");
      }
      if (isDraft) {
        setIsDraftSaving(false);
      } else {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      // 1. Upload images to Supabase Storage first
      const uploadedImageUrls: string[] = [];

      if (selectedImageFiles.length > 0) {
        // Create a temporary blog ID for organizing images
        const tempBlogId = `temp-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}`;

        for (const file of selectedImageFiles) {
          const fileExt = file.name.split(".").pop();
          const filePath = `blogs/${tempBlogId}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("blogs")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Image upload failed:", uploadError.message);
            toast.error("Failed to upload image: " + uploadError.message);
            continue;
          }

          const { data: publicData } = supabase.storage
            .from("blogs")
            .getPublicUrl(filePath);

          uploadedImageUrls.push(publicData.publicUrl);
        }
      }

      // 2. Create blog using API route
      const response = await fetch("/api/admin/blogs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          link_name: data.link_name,
          link: data.link,
          content: data.content,
          status: isDraft ? "draft" : "published",
          tags: selectedTags.map((tag) => tag.id),
          images: uploadedImageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create blog");
      }

      toast.success(
        isDraft
          ? "Blog saved as draft successfully!"
          : "Blog created successfully!"
      );
      router.push("/staff/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      if (isDraft) {
        setIsDraftSaving(false);
      } else {
        setIsSubmitting(false);
      }
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    await handleSubmit(data, false);
  };

  const onSaveDraft = async () => {
    const formData = form.getValues();
    // For drafts, we don't need to validate as strictly
    // Just ensure we have at least a title
    if (!formData.title.trim()) {
      toast.error("Blog title is required even for drafts.");
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
            { label: "Blogs", href: "/staff/blogs" },
            { label: "New Blog" },
          ]}
        />

        <div className="flex items-center justify-between">
          <TypographyH2 className="border-none pb-0">
            Create New Blog
          </TypographyH2>
          <div className="flex items-center gap-2">
            <Link href="/staff/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Blogs</span>
                <span className="inline sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Blog Information - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Blog Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>Blog Information</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Enter the basic details of the blog.
                  </TypographyP>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., How to Choose the Right Cement for Your Project"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The title of your blog (max 200 characters).
                      </FormDescription>
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
                          placeholder="A brief description of the blog content..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A short description or summary (max 500 characters).
                      </FormDescription>
                      <div className="min-h-[10px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Link Section */}
                <div className="space-y-6 pt-6 border-t">
                  <div>
                    <TypographyH3>Link (Optional)</TypographyH3>
                    <TypographyP className="!mt-0">
                      Add an internal page link or external website link.
                    </TypographyP>
                  </div>

                  <FormField
                    control={form.control}
                    name="linkType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select link type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="internal">
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-green-500" />
                                Internal Page
                              </div>
                            </SelectItem>
                            <SelectItem value="external">
                              <div className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4 text-blue-500" />
                                External Website
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose whether to link to an internal page or external
                          website.
                        </FormDescription>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              form.watch("linkType") === "external"
                                ? "Visit Our Website"
                                : "Explore Products"
                            }
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          A human-readable name for the link (e.g., "Explore
                          Products", "Read More", "Visit Website")
                        </FormDescription>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("linkType") === "external"
                            ? "External URL"
                            : "Internal Page Path"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              form.watch("linkType") === "external"
                                ? "https://example.com"
                                : "/staff/products"
                            }
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("linkType") === "external"
                            ? "Full URL starting with http:// or https://"
                            : "Internal page path starting with / (e.g., /staff/products, /comparison)"}
                        </FormDescription>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Link Preview */}
                  {form.watch("link") && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center gap-2 text-sm">
                        {form.watch("linkType") === "external" ? (
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        ) : (
                          <LinkIcon className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">
                          {form.watch("linkType") === "external"
                            ? "External Link:"
                            : "Internal Link:"}
                        </span>
                        <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {form.watch("link")}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags Section - moved here, under Link */}
                <div className="space-y-4 pt-6 border-t">
                  <div>
                    <TypographyH3>Tags</TypographyH3>
                    <TypographyP className="!mt-0">
                      Select or create tags to categorize this blog.
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
                <CardTitle>
                  <TypographyH3>Upload Images</TypographyH3>
                </CardTitle>
                <CardDescription>
                  Upload 1 main image and up to 4 additional images for the
                  blog.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Image Files</FormLabel>
                  <FormDescription>
                    Upload 1 main image and up to 4 additional images. Accepted
                    formats: JPG, PNG, GIF. Max size: 10MB per file.
                  </FormDescription>
                  <div className="min-h-[10px]">
                    {imageError && <FormMessage>{imageError}</FormMessage>}
                  </div>
                </FormItem>
                <div className="mt-4">
                  {/* Main Image Display */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {selectedImageFiles.length > 0 ? (
                        <>
                          <Image
                            src={URL.createObjectURL(selectedImageFiles[0])}
                            alt="Main blog image"
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
                                Upload main blog image
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
                      PNG, GIF. Max size: 10MB per file.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Section - Markdown Editor */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TypographyH3>Blog Content</TypographyH3>
              </CardTitle>
              <CardDescription>
                <TypographyP className="!mt-0">
                  Write the main content of your blog using the Markdown editor.
                </TypographyP>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <div className="flex flex-col" data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                          height={isMobile ? 400 : 500}
                          preview={isMobile ? "edit" : "live"}
                          previewOptions={{
                            rehypePlugins: isMobile
                              ? [rehypeSanitize]
                              : undefined,
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Write your blog content in Markdown. You can use headings,
                      lists, images, etc.
                    </FormDescription>
                    <div className="min-h-[10px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center">
            <Link href="/staff/blogs">
              <Button variant="outline" type="button">
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
                {isSubmitting ? "Publishing..." : "Publish Blog"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
