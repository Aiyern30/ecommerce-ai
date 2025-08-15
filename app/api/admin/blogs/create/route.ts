// app/api/admin/blogs/create/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await req.json();
    const {
      title,
      description,
      link_name,
      link,
      content,
      status,
      tags,
      images,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // 1. Insert main blog
    const { data: blog, error: blogError } = await supabase
      .from("blogs")
      .insert({
        title,
        description: description || null,
        link_name: link_name || null,
        link: link || null,
        content,
        status: status || "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (blogError) {
      return NextResponse.json(
        { error: "Failed to create blog: " + blogError.message },
        { status: 500 }
      );
    }

    const blogId = blog.id;

    // 2. Insert tags if provided
    if (Array.isArray(tags) && tags.length > 0) {
      const { error: tagsError } = await supabase.from("blog_tags").insert(
        tags.map((tagId: string) => ({
          blog_id: blogId,
          tag_id: tagId,
        }))
      );

      if (tagsError) {
        console.error("Failed to insert blog tags:", tagsError.message);
        // Don't fail the entire operation for tags, just log the error
      }
    }

    // 3. Insert images if provided
    if (Array.isArray(images) && images.length > 0) {
      const { error: imagesError } = await supabase.from("blog_images").insert(
        images.map((imageUrl: string) => ({
          blog_id: blogId,
          image_url: imageUrl,
        }))
      );

      if (imagesError) {
        console.error("Failed to insert blog images:", imagesError.message);
        // Don't fail the entire operation for images, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      blogId,
      message:
        status === "draft"
          ? "Blog saved as draft"
          : "Blog created successfully",
    });
  } catch (error) {
    console.error("Unexpected error during blog creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
