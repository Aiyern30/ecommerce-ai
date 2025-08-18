import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || "User not found" },
        { status: 404 }
      );
    }

    const user = data.user;
    // Map to Customer type with more info
    const customer = {
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      phone: user.phone || "",
      location: user.user_metadata?.location || "",
      status: user.user_metadata?.status || "active",
      role: user.app_metadata?.role || user.user_metadata?.role || "customer",
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at,
      providers: user.app_metadata?.providers || [],
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at,
      // Remove is_super_admin and banned_until (not in type User)
      is_sso_user: user.is_sso_user ?? false,
      is_anonymous: user.is_anonymous ?? false,
      deleted_at: user.deleted_at,
      email_verified: user.user_metadata?.email_verified ?? false,
      phone_verified: user.user_metadata?.phone_verified ?? false,
      provider_id: user.user_metadata?.provider_id || "",
    };

    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}
