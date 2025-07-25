import stripe from "@/lib/stripe/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = body.amount;
    if (!amount || typeof amount !== "number") {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "myr",
      automatic_payment_methods: { enabled: true },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Unable to create PaymentIntent" }),
      { status: 500 }
    );
  }
}
