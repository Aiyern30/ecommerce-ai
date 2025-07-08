// app/api/verify-otp/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import twilio from "twilio";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_ID = process.env.TWILIO_VERIFY_SERVICE_SID!;

export async function POST(req: Request) {
  const { phone, code, user_id } = await req.json();

  // First verify with Twilio
  const result = await client.verify.v2
    .services(VERIFY_SERVICE_ID)
    .verificationChecks.create({ to: phone, code });

  if (result.status !== "approved") {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  // Then update Supabase user
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    phone,
    user_metadata: { phone_verified: true },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
