/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Initialize Gemini AI with error handling
let genAI: GoogleGenerativeAI | null = null;
try {
  if (process.env.GOOGLE_AI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
} catch (error) {
  console.error("Failed to initialize Google AI:", error);
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: string;
  metadata?: any;
}

// Simple system prompt
function generateSimpleSystemPrompt(): string {
  return `You are an AI assistant for a Malaysian concrete supply company specializing in ready-mix concrete. 

CONCRETE GRADES AVAILABLE:
- N-Series: N10, N15, N20, N25 (suitable for residential and light commercial use)
- S-Series: S30, S35, S40, S45 (suitable for structural and heavy-duty applications)

DELIVERY METHODS:
- Normal Delivery: Standard concrete truck delivery
- Pump Delivery: Concrete pump for hard-to-reach areas

BUSINESS CONTEXT:
- Prices are in Malaysian Ringgit (RM) per cubic meter (m³)
- We serve the Malaysian construction market
- Focus on quality ready-mix concrete for various construction needs

Keep responses professional but conversational and help customers choose the right concrete grade for their projects.`;
}

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "Gemini API route is working!",
    timestamp: new Date().toISOString(),
    hasGoogleAI: !!genAI,
    hasAPIKey: !!process.env.GOOGLE_AI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Basic validation
    if (!genAI) {
      return NextResponse.json(
        { error: "Google AI not properly configured" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { message, conversationHistory } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Initialize Supabase client with error handling
    let user = null;
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (!authError) {
        user = authUser;
      }
    } catch (error) {
      console.error("Auth error:", error);
      // Continue without user authentication
    }

    // Simple cart handling
    if (/show.*cart/i.test(message)) {
      if (!user?.id) {
        return NextResponse.json({
          message: "Please login to view your cart.",
          type: "cart",
          metadata: { cart: [] },
        });
      }

      // Try to get cart items with error handling
      try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: cartItems, error } = await supabase
          .from("cart_items")
          .select(
            `
            id,
            quantity,
            variant_type,
            product:products (
              id,
              name,
              normal_price,
              pump_price,
              unit
            )
          `
          )
          .eq("user_id", user.id);

        if (error) throw error;

        return NextResponse.json({
          message:
            cartItems && cartItems.length > 0
              ? "Here are the items in your cart:"
              : "Your cart is empty.",
          type: "cart",
          metadata: { cart: cartItems || [] },
        });
      } catch (error) {
        console.error("Cart error:", error);
        return NextResponse.json({
          message: "Unable to fetch cart items at the moment.",
          type: "cart",
          metadata: { cart: [] },
        });
      }
    }

    // Simple order tracking
    if (/(order status|track order|my orders)/i.test(message)) {
      if (!user?.id) {
        return NextResponse.json({
          message: "Please login to view your orders.",
          type: "order",
          metadata: { orders: [] },
        });
      }

      try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: orders, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            order_number,
            status,
            payment_status,
            total,
            created_at
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        return NextResponse.json({
          message:
            orders && orders.length > 0
              ? "Here are your recent orders:"
              : "You have no recent orders.",
          type: "order",
          metadata: { orders: orders || [] },
        });
      } catch (error) {
        console.error("Orders error:", error);
        return NextResponse.json({
          message: "Unable to fetch orders at the moment.",
          type: "order",
          metadata: { orders: [] },
        });
      }
    }

    // Prepare conversation context
    const conversationContext =
      conversationHistory
        ?.slice(-3)
        ?.map(
          (msg: Message) =>
            `${msg.sender === "user" ? "Customer" : "Assistant"}: ${
              msg.content
            }`
        )
        ?.join("\n") || "";

    // Generate system prompt
    const systemPrompt = generateSimpleSystemPrompt();

    // Prepare the full prompt
    const fullPrompt = `${systemPrompt}

Conversation History:
${conversationContext}

Customer: ${message}

Please provide a helpful and informed response about concrete products and services.`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Simple response
    return NextResponse.json({
      message: aiResponse,
      type: "text",
      metadata: {
        suggestions: [
          "Tell me about N-series concrete",
          "What's the difference between N20 and N25?",
          "Show me pricing options",
          "Delivery methods available",
        ],
      },
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return NextResponse.json(
      {
        message:
          "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or feel free to contact our sales team directly for immediate assistance with your concrete needs.",
        type: "error",
        metadata: {
          suggestions: [
            "Try asking about specific grades",
            "Ask about pricing",
            "Contact sales team",
          ],
        },
      },
      { status: 500 }
    );
  }
}
