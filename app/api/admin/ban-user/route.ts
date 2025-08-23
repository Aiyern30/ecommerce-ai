/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/ban-user/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { userId, bannedUntil, reason } = await request.json();

    // Validation
    if (!userId || !bannedUntil) {
      return NextResponse.json(
        { error: "User ID and banned until date are required" },
        { status: 400 }
      );
    }

    // Validate bannedUntil is a future date
    const banDate = new Date(bannedUntil);
    if (banDate <= new Date()) {
      return NextResponse.json(
        { error: "Ban date must be in the future" },
        { status: 400 }
      );
    }

    // Get current user data first to preserve app_metadata
    const { data: currentUser, error: getUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError || !currentUser?.user) {
      console.error("Error getting user:", getUserError);
      return NextResponse.json(
        { error: "Failed to get user data" },
        { status: 500 }
      );
    }

    // Get the admin user making this request (for audit trail)
    const bannedBy = "system"; // Replace with actual admin user ID/email

    // Update banned_until at user level and ban_info in app_metadata
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        // @ts-expect-error: banned_until is a valid Supabase user field but not in types
        banned_until: bannedUntil,
        app_metadata: {
          ...(currentUser.user.app_metadata || {}),
          ban_info: {
            reason: reason || "No reason provided",
            banned_at: new Date().toISOString(),
            banned_by: bannedBy,
            banned_until: bannedUntil,
            previous_bans: [
              ...(currentUser.user.app_metadata?.ban_info?.previous_bans || []),
              // @ts-expect-error banned_until exists in Supabase but not in types

              ...(currentUser.user.banned_until
                ? []
                : [
                    {
                      banned_at: new Date().toISOString(),
                      banned_until: bannedUntil,
                      reason: reason || "No reason provided",
                      banned_by: bannedBy,
                    },
                  ]),
            ],
          },
        },
      });

    if (userError) {
      console.error("Error banning user:", userError);
      return NextResponse.json(
        { error: "Failed to ban user" },
        { status: 500 }
      );
    }

    // Optional: Insert into ban_history table for audit trail
    const { error: historyError } = await supabaseAdmin
      .from("ban_history")
      .insert({
        user_id: userId,
        banned_until: bannedUntil,
        reason: reason || "No reason provided",
        banned_at: new Date().toISOString(),
        banned_by: bannedBy,
        action: "ban",
      });

    if (historyError) {
      console.warn("Failed to log ban history:", historyError);
    }

    return NextResponse.json({
      success: true,
      message: `User banned until ${new Date(
        bannedUntil
      ).toLocaleDateString()}`,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        banned_until: (userData.user as any).banned_until,
        ban_info: userData.user.app_metadata?.ban_info,
      },
      debug: {
        bannedUntil: (userData.user as any).banned_until,
        banInfo: userData.user.app_metadata?.ban_info,
      },
    });
  } catch (error) {
    console.error("Ban user API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get current user data to preserve other app_metadata
    const { data: currentUser, error: getUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError) {
      console.error("Error getting user:", getUserError);
      return NextResponse.json(
        { error: "Failed to get user data" },
        { status: 500 }
      );
    }

    const unbannedBy = "system"; // Replace with actual admin user ID/email

    // Remove ban by setting banned_until to null at user level and update ban_info in app_metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        // @ts-expect-error: banned_until is a valid Supabase user field but not in types
        banned_until: null,
        app_metadata: {
          ...(currentUser?.user?.app_metadata || {}),
          ban_info: {
            ...(currentUser.user.app_metadata?.ban_info || {}),
            unbanned_at: new Date().toISOString(),
            unbanned_by: unbannedBy,
            reason: undefined,
            banned_at: undefined,
            banned_until: undefined,
          },
        },
      }
    );

    if (error) {
      console.error("Error unbanning user:", error);
      return NextResponse.json(
        { error: "Failed to unban user" },
        { status: 500 }
      );
    }

    // Optional: Insert into ban_history table for audit trail
    const { error: historyError } = await supabaseAdmin
      .from("ban_history")
      .insert({
        user_id: userId,
        banned_until: null,
        reason: "User unbanned",
        banned_at: new Date().toISOString(),
        banned_by: unbannedBy,
        action: "unban",
      });

    if (historyError) {
      console.warn("Failed to log unban history:", historyError);
    }

    return NextResponse.json({
      success: true,
      message: "User unbanned successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        banned_until: (data.user as any).banned_until,
        ban_info: data.user.app_metadata?.ban_info,
      },
      debug: {
        bannedUntil: (data.user as any).banned_until,
        banInfo: data.user.app_metadata?.ban_info,
      },
    });
  } catch (error) {
    console.error("Unban user API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
