// /app/api/posts/update/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json();
  const { postId, ...updateData } = body;

  const { data, error } = await supabaseAdmin
    .from("posts")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
