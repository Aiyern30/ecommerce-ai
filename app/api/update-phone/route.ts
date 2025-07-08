import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Only use this server-side
);

export async function POST(req: NextRequest) {
  const { user_id, phone } = await req.json();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    phone,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
