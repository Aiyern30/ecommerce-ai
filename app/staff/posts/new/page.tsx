/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, X, ExternalLink, LinkIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/";
import { TypographyH2 } from "@/components/ui/Typography";
import Image from "next/image";
import { toast } from "sonner";

// Zod schema for post creation
const postSchema = z.object({
  title: z
    .string()
    .min(1, "Post title is required")
    .max(200, "Title must be less than 200 characters"),
  body: z.string().min(1, "Post body is required"),
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
});

type PostFormData = z.infer<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      body: "",
      description: "",
      link_name: "",
      link: "",
      linkType: "internal",
    },
  });

  const linkType = form.watch("linkType");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setImageError("File must be an image.");
        setSelectedImageFile(null);
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setImageError("File size must be less than 5MB.");
        setSelectedImageFile(null);
        e.target.value = "";
        return;
      }

      setSelectedImageFile(file);
      setImageError(null);
    } else {
      setSelectedImageFile(null);
      setImageError(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImageError(null);
    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
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

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    setImageError(null);

    // Validate link based on type
    if (data.link && !validateLink(data.link, data.linkType)) {
      if (data.linkType === "external") {
        toast.error("External links must start with http:// or https://");
      } else {
        toast.error("Internal links must start with / (e.g., /staff/products)");
      }
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split(".").pop();
        const filePath = `posts/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, selectedImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload failed:", uploadError.message);
          toast.error(`Failed to upload image: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);
        imageUrl = publicData.publicUrl;
      }

      // Insert post data
      const { error: postInsertError } = await supabase.from("posts").insert({
        title: data.title,
        body: data.body,
        description: data.description || null,
        link_name: data.link_name || null,
        link: data.link || null,
        image_url: imageUrl,
      });

      if (postInsertError) {
        toast.error("Post creation failed: " + postInsertError.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Post created successfully!");
      router.push("/staff/posts");
    } catch (error) {
      console.error("Unexpected error during post creation:", error);
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
              <BreadcrumbLink href="/staff/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/posts">Posts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>New Post</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <TypographyH2 className="border-none pb-0">
            Create New Post
          </TypographyH2>
          <div className="flex items-center gap-2">
            <Link href="/staff/posts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
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
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Enter the basic details of the post.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., How to Choose the Right Cement for Your Project"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The title of your post (max 200 characters).
                    </FormDescription>
                    <FormMessage />
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
                        placeholder="A brief description of the post content..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A short description or summary (max 500 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post content here..."
                        className="resize-none min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main content of your post.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Link Section */}
          <Card>
            <CardHeader>
              <CardTitle>Link (Optional)</CardTitle>
              <CardDescription>
                Add an internal page link or external website link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <FormMessage />
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
                          linkType === "external"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {linkType === "external"
                        ? "External URL"
                        : "Internal Page Path"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          linkType === "external"
                            ? "https://example.com"
                            : "/staff/products"
                        }
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {linkType === "external"
                        ? "Full URL starting with http:// or https://"
                        : "Internal page path starting with / (e.g., /staff/products, /comparison)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link Preview */}
              {form.watch("link") && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    {linkType === "external" ? (
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                    ) : (
                      <LinkIcon className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium">
                      {linkType === "external"
                        ? "External Link:"
                        : "Internal Link:"}
                    </span>
                    <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {form.watch("link")}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Post Image</CardTitle>
              <CardDescription>
                Upload an optional image for the post.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormItem>
                <FormLabel>Image File</FormLabel>
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
              {selectedImageFile && (
                <div className="mt-4">
                  <div className="relative inline-block">
                    <Image
                      src={
                        URL.createObjectURL(selectedImageFile) ||
                        "/placeholder.svg"
                      }
                      alt="Preview"
                      className="object-cover rounded-md"
                      width={200}
                      height={200}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/staff/posts">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Post..." : "Create Post"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
