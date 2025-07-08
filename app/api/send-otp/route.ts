/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/send-otp/route.ts
import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_ID = process.env.TWILIO_VERIFY_SERVICE_SID!;

export async function POST(req: Request) {
  const { phone } = await req.json();

  try {
    const verification = await client.verify.v2
      .services(VERIFY_SERVICE_ID)
      .verifications.create({ to: phone, channel: "sms" });
    console.log("Sent verification:", verification.status);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
