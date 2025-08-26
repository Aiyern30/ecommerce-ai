import { type NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    console.log("Creating PaymentIntent for amount:", amount, "RM");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "myr",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        created_at: new Date().toISOString(),
        amount_rm: amount.toString(),
      },
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
