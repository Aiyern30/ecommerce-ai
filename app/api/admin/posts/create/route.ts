// /app/api/admin/posts/create/route.ts

import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    title,
    description,
    mobile_description,
    link_name,
    link,
    image_url,
    status,
  } = body;

  if (!title || !status) {
    return NextResponse.json(
      { error: "Title and status are required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("posts").insert({
    title,
    description,
    mobile_description: mobile_description || null,
    link_name: link_name || null,
    link: link || null,
    image_url: image_url || null,
    status,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to create post: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
