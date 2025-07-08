// app/api/update-phone/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // only use in server-side
);

export async function POST(req: Request) {
  const { phone, user_id } = await req.json();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    phone,
    user_metadata: { phone_verified: true },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
