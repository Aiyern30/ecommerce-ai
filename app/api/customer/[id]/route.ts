import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
interface Customer {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  status: "active" | "inactive" | "banned";
  role: "customer" | "admin" | "staff";
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  ban_info?: {
    reason?: string;
    banned_at?: string;
    banned_by?: string;
    banned_by_email?: string;
    banned_by_name?: string;
    banned_until?: string;
    previous_bans?: {
      reason?: string;
      banned_at?: string;
      banned_by?: string;
      banned_by_email?: string;
      banned_by_name?: string;
      banned_until?: string;
    }[];
    unbanned_at?: string;
    unbanned_by?: string;
    unbanned_by_email?: string;
    unbanned_by_name?: string;
  };
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;

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

    const banInfo = user.app_metadata?.ban_info
      ? {
          reason: user.app_metadata.ban_info.reason,
          banned_at: user.app_metadata.ban_info.banned_at,
          banned_by: user.app_metadata.ban_info.banned_by,
          banned_by_email: user.app_metadata.ban_info.banned_by_email,
          banned_by_name: user.app_metadata.ban_info.banned_by_name,
          banned_until: user.app_metadata.ban_info.banned_until,
          previous_bans: user.app_metadata.ban_info.previous_bans || [],
          unbanned_at: user.app_metadata.ban_info.unbanned_at,
          unbanned_by: user.app_metadata.ban_info.unbanned_by,
          unbanned_by_email: user.app_metadata.ban_info.unbanned_by_email,
          unbanned_by_name: user.app_metadata.ban_info.unbanned_by_name,
        }
      : undefined;

    const customer: Customer = {
      id: user.id,
      email: user.email ?? "",
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      phone: user.phone || "",
      location: user.user_metadata?.location || "",
      status:
        banInfo?.banned_until && new Date(banInfo.banned_until) > new Date()
          ? "banned"
          : user.user_metadata?.status === "inactive"
          ? "inactive"
          : "active",
      role: user.app_metadata?.role || user.user_metadata?.role || "customer",
      created_at: user.created_at ?? "",
      updated_at: user.updated_at ?? "",
      last_sign_in_at: user.last_sign_in_at ?? undefined,
      ban_info: banInfo,
    };

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
