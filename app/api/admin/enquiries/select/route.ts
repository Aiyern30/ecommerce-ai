import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch enquiries
    const { data: enquiries, error: enquiriesError } = await supabaseAdmin
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (enquiriesError) {
      return NextResponse.json(
        { error: enquiriesError.message },
        { status: 500 }
      );
    }

    // 2. Optionally fetch related user data (if you want to show user info)
    // const { data: users, error: usersError } = await supabaseAdmin
    //   .from("users")
    //   .select("*");
    // if (usersError) {
    //   return NextResponse.json({ error: usersError.message }, { status: 500 });
    // }

    // 3. Merge user info if needed (uncomment if you fetch users)
    // const enquiriesWithUser = enquiries.map((enq) => ({
    //   ...enq,
    //   user: users.find((u) => u.id === enq.user_id) || null,
    // }));

    // 4. Return enquiries (with or without user info)
    return NextResponse.json({ enquiries /*: enquiriesWithUser*/ });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
