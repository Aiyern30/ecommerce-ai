import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, adminUserId } = body;

    // Validate input - need either userId or email
    if (!userId && !email) {
      return NextResponse.json(
        { error: "Either userId or email is required" },
        { status: 400 }
      );
    }

    if (!adminUserId) {
      return NextResponse.json(
        { error: "Admin user ID is required" },
        { status: 400 }
      );
    }

    // Verify the requesting user is an admin
    const { data: adminUser, error: adminError } =
      await supabaseAdmin.auth.admin.getUserById(adminUserId);

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: "Invalid admin user" },
        { status: 401 }
      );
    }

    const adminRole =
      adminUser.user.app_metadata?.role || adminUser.user.user_metadata?.role;
    if (adminRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can promote users to staff" },
        { status: 403 }
      );
    }

    // Call the RPC function to promote user to staff
    const { data: result, error: rpcError } = await supabaseAdmin.rpc(
      "promote_user_to_staff",
      {
        admin_user_id: adminUserId,
        user_email: email || null,
        user_id: userId || null,
      }
    );

    if (rpcError) {
      console.error("Error calling promote_user_to_staff RPC:", rpcError);
      return NextResponse.json(
        { error: `Failed to promote user: ${rpcError.message}` },
        { status: 500 }
      );
    }

    // Check if the RPC function returned an error
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Check if the operation was successful
    if (!result?.success) {
      return NextResponse.json(
        { error: "Failed to promote user to staff" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully promoted user ${result.email} to staff role`,
        userId: result.user_id,
        email: result.email,
        promotedAt: result.promoted_at,
        promotedBy: result.promoted_by,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in add-staff API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while promoting user to staff" },
      { status: 500 }
    );
  }
}

// DELETE method to remove staff role
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, adminUserId } = body;

    if (!userId || !adminUserId) {
      return NextResponse.json(
        { error: "User ID and admin user ID are required" },
        { status: 400 }
      );
    }

    // Verify the requesting user is an admin
    const { data: adminUser, error: adminError } =
      await supabaseAdmin.auth.admin.getUserById(adminUserId);

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: "Invalid admin user" },
        { status: 401 }
      );
    }

    const adminRole =
      adminUser.user.app_metadata?.role || adminUser.user.user_metadata?.role;
    if (adminRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can demote staff users" },
        { status: 403 }
      );
    }

    // Call the RPC function to demote user from staff
    const { data: result, error: rpcError } = await supabaseAdmin.rpc(
      "demote_user_from_staff",
      {
        admin_user_id: adminUserId,
        user_id: userId,
      }
    );

    if (rpcError) {
      console.error("Error calling demote_user_from_staff RPC:", rpcError);
      return NextResponse.json(
        { error: `Failed to demote user: ${rpcError.message}` },
        { status: 500 }
      );
    }

    // Check if the RPC function returned an error
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Check if the operation was successful
    if (!result?.success) {
      return NextResponse.json(
        { error: "Failed to demote user from staff" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully demoted user ${result.email} from staff role`,
        userId: result.user_id,
        email: result.email,
        demotedAt: result.demoted_at,
        demotedBy: result.demoted_by,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in remove-staff API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while demoting user from staff" },
      { status: 500 }
    );
  }
}
