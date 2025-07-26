import { type NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID required" },
        { status: 400 }
      );
    }

    // Retrieve the PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Error verifying PaymentIntent:", error);
    return NextResponse.json(
      { error: "PaymentIntent not found or invalid" },
      { status: 404 }
    );
  }
}
