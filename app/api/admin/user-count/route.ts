import { NextResponse } from "next/server";

export async function GET() {
  const { createClient } = await import("@supabase/supabase-js");

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({});

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: data.users.length });
}
