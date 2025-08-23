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

// Helper function to get admin user info for audit trail
async function getAdminUserInfo(adminUserId?: string) {
  if (!adminUserId) {
    console.warn("No adminUserId provided, using 'system'");
    return {
      id: "system",
      email: "system",
      full_name: "System",
    };
  }

  try {
    const { data: adminUser, error } =
      await supabaseAdmin.auth.admin.getUserById(adminUserId);

    if (error || !adminUser?.user) {
      console.warn("Could not fetch admin user info:", error?.message);
      return {
        id: adminUserId,
        email: "unknown",
        full_name: "Unknown Admin",
      };
    }

    return {
      id: adminUser.user.id,
      email: adminUser.user.email || "unknown",
      full_name:
        adminUser.user.user_metadata?.full_name ||
        adminUser.user.user_metadata?.name ||
        adminUser.user.email ||
        "Unknown Admin",
    };
  } catch (error) {
    console.warn("Error fetching admin user info:", error);
    return {
      id: adminUserId,
      email: "unknown",
      full_name: "Unknown Admin",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, bannedUntil, reason, adminUserId } = await request.json();

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

    // Get admin user info for audit trail
    const adminInfo = await getAdminUserInfo(adminUserId);

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

    // Prepare the ban info object
    const banInfo = {
      reason: reason || "No reason provided",
      banned_at: new Date().toISOString(),
      banned_by: adminInfo.id,
      banned_by_email: adminInfo.email,
      banned_by_name: adminInfo.full_name,
      banned_until: bannedUntil,
      previous_bans: [
        ...(currentUser.user.app_metadata?.ban_info?.previous_bans || []),
        // Add current ban to history if user was previously banned
        ...(currentUser.user.app_metadata?.ban_info?.banned_until
          ? [
              {
                reason:
                  currentUser.user.app_metadata.ban_info.reason ||
                  "Previous ban",
                banned_at:
                  currentUser.user.app_metadata.ban_info.banned_at ||
                  new Date().toISOString(),
                banned_by:
                  currentUser.user.app_metadata.ban_info.banned_by || "unknown",
                banned_by_email:
                  currentUser.user.app_metadata.ban_info.banned_by_email ||
                  "unknown",
                banned_by_name:
                  currentUser.user.app_metadata.ban_info.banned_by_name ||
                  "Unknown",
                banned_until:
                  currentUser.user.app_metadata.ban_info.banned_until,
              },
            ]
          : []),
      ],
    };

    // Update banned_until at user level and ban_info in app_metadata
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        // @ts-expect-error: banned_until is a valid Supabase user field but not in types
        banned_until: bannedUntil,
        app_metadata: {
          ...(currentUser.user.app_metadata || {}),
          ban_info: banInfo,
        },
      });

    if (userError) {
      console.error("Error banning user:", userError);
      return NextResponse.json(
        { error: "Failed to ban user" },
        { status: 500 }
      );
    }

    // Insert into ban_history table for audit trail
    const { error: historyError } = await supabaseAdmin
      .from("ban_history")
      .insert({
        user_id: userId,
        banned_until: bannedUntil,
        reason: reason || "No reason provided",
        banned_at: new Date().toISOString(),
        banned_by: adminInfo.id,
        banned_by_email: adminInfo.email,
        banned_by_name: adminInfo.full_name,
        action: "ban",
      });

    if (historyError) {
      console.warn("Failed to log ban history:", historyError);
      // Don't fail the request if history logging fails
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
      banned_by: adminInfo,
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
    const { userId, adminUserId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get admin user info for audit trail
    const adminInfo = await getAdminUserInfo(adminUserId);

    // Get current user data to preserve other app_metadata
    const { data: currentUser, error: getUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError || !currentUser?.user) {
      console.error("Error getting user:", getUserError);
      return NextResponse.json(
        { error: "Failed to get user data" },
        { status: 500 }
      );
    }

    // Prepare updated ban info - keep history but clear current ban
    const updatedBanInfo = {
      ...(currentUser.user.app_metadata?.ban_info || {}),
      // Clear current ban fields
      reason: undefined,
      banned_at: undefined,
      banned_by: undefined,
      banned_by_email: undefined,
      banned_by_name: undefined,
      banned_until: undefined,
      // Set unban info
      unbanned_at: new Date().toISOString(),
      unbanned_by: adminInfo.id,
      unbanned_by_email: adminInfo.email,
      unbanned_by_name: adminInfo.full_name,
    };

    // Remove ban by setting banned_until to null at user level and update ban_info in app_metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        // @ts-expect-error: banned_until is a valid Supabase user field but not in types
        banned_until: null,
        app_metadata: {
          ...(currentUser?.user?.app_metadata || {}),
          ban_info: updatedBanInfo,
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

    // Insert into ban_history table for audit trail
    const { error: historyError } = await supabaseAdmin
      .from("ban_history")
      .insert({
        user_id: userId,
        banned_until: null,
        reason: "User unbanned",
        banned_at: new Date().toISOString(),
        banned_by: adminInfo.id,
        banned_by_email: adminInfo.email,
        banned_by_name: adminInfo.full_name,
        action: "unban",
      });

    if (historyError) {
      console.warn("Failed to log unban history:", historyError);
      // Don't fail the request if history logging fails
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
      unbanned_by: adminInfo,
    });
  } catch (error) {
    console.error("Unban user API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
