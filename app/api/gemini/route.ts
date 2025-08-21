/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ConcreteIntentAnalyzer } from "@/lib/gemini/concreteIntentAnalyzer";

import {
  getCartItemsServerSide,
  getRecentOrdersServerSide,
  removeFromCartServerSide,
  updateCartItemQuantityServerSide,
} from "@/lib/cart/serverUtils";
import { Product } from "@/type/product";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: string;
  metadata?: any;
}

// Enhanced product search with concrete-specific logic
async function searchProducts(
  query: string,
  grade?: string,
  gradeRange?: { min?: string; max?: string },
  deliveryMethod?: string,
  priceRange?: { min?: number; max?: number },
  limit = 5
): Promise<Product[]> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    let queryBuilder = supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `
      )
      .eq("is_active", true)
      .eq("status", "published")
      .gt("stock_quantity", 0);

    // Grade-specific filtering
    if (grade) {
      queryBuilder = queryBuilder.eq("grade", grade);
    } else if (gradeRange) {
      // Handle grade range filtering for N-series and S-series
      const conditions = [];
      if (gradeRange.min) conditions.push(`grade.gte.${gradeRange.min}`);
      if (gradeRange.max) conditions.push(`grade.lte.${gradeRange.max}`);
      // Note: This might need custom logic for proper grade comparison
    }

    // Price range filtering based on delivery method
    if (priceRange) {
      const priceColumn = getPriceColumn(deliveryMethod);
      if (priceRange.min)
        queryBuilder = queryBuilder.gte(priceColumn, priceRange.min);
      if (priceRange.max)
        queryBuilder = queryBuilder.lte(priceColumn, priceRange.max);
    }

    // Text search in multiple fields
    if (query && query.length > 2) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%, description.ilike.%${query}%, grade.ilike.%${query}%, keywords.cs.{${query}}`
      );
    }

    queryBuilder = queryBuilder
      .order("is_featured", { ascending: false })
      .order("grade", { ascending: true })
      .limit(limit);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Product search error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

// Get recommendations based on intent analysis
async function getSmartRecommendations(
  intentData: any,
  limit = 3
): Promise<Product[]> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    let queryBuilder = supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `
      )
      .eq("is_active", true)
      .eq("status", "published")
      .gt("stock_quantity", 0);

    // Use intent analysis to provide smart recommendations
    if (intentData.applicationType || intentData.projectType) {
      const recommendedGrades = ConcreteIntentAnalyzer.getGradeRecommendations(
        intentData.applicationType,
        intentData.projectType
      );

      if (recommendedGrades.length > 0) {
        queryBuilder = queryBuilder.in("grade", recommendedGrades);
      }
    }

    // If specific grade mentioned, include similar grades
    if (intentData.grade) {
      const grade = intentData.grade;
      const gradeNumber = parseInt(grade.substring(1));
      const gradeSeries = grade.charAt(0);

      // Get similar grades (±5 in same series)
      const similarGrades = [];
      for (
        let i = Math.max(gradeNumber - 5, 10);
        i <= Math.min(gradeNumber + 5, 45);
        i += 5
      ) {
        if (
          (gradeSeries === "N" && i <= 25) ||
          (gradeSeries === "S" && i >= 30 && i <= 45)
        ) {
          similarGrades.push(`${gradeSeries}${i}`);
        }
      }

      if (similarGrades.length > 0) {
        queryBuilder = queryBuilder.in("grade", similarGrades);
      }
    }

    queryBuilder = queryBuilder
      .order("is_featured", { ascending: false })
      .order("stock_quantity", { ascending: false })
      .limit(limit);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Recommendations error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

// Helper function to get the appropriate price column
function getPriceColumn(deliveryMethod?: string): string {
  switch (deliveryMethod) {
    case "pump":
      return "pump_price";
    case "tremie_1":
      return "tremie_1_price";
    case "tremie_2":
      return "tremie_2_price";
    case "tremie_3":
      return "tremie_3_price";
    default:
      return "normal_price";
  }
}

// Generate enhanced system prompt with concrete business context
function generateSystemPrompt(
  products: Product[],
  intentAnalysis: any
): string {
  const productContext =
    products.length > 0
      ? `Here are relevant concrete products from our catalog:\n${products
          .map((p) => {
            const prices = [];
            if (p.normal_price) prices.push(`Normal: RM${p.normal_price}`);
            if (p.pump_price) prices.push(`Pump: RM${p.pump_price}`);
            if (p.tremie_1_price)
              prices.push(`Tremie 1: RM${p.tremie_1_price}`);
            if (p.tremie_2_price)
              prices.push(`Tremie 2: RM${p.tremie_2_price}`);
            if (p.tremie_3_price)
              prices.push(`Tremie 3: RM${p.tremie_3_price}`);

            return `- ${p.name} (Grade ${p.grade}): ${
              p.description
            }\n  Pricing: ${prices.join(", ")} ${
              p.unit || "per m³"
            }\n  Stock: ${p.stock_quantity} units`;
          })
          .join("\n\n")}`
      : "No specific products found for this query.";

  const intentContext = `
Customer Intent Analysis:
- Intent: ${intentAnalysis.intent}
- Confidence: ${Math.round(intentAnalysis.confidence * 100)}%
- Extracted Data: ${JSON.stringify(intentAnalysis.extractedData, null, 2)}`;

  return `You are an AI assistant for a Malaysian concrete supply company specializing in ready-mix concrete. Our product range includes:

CONCRETE GRADES AVAILABLE:
- N-Series: N10, N15, N20, N25 (suitable for residential and light commercial use)
- S-Series: S30, S35, S40, S45 (suitable for structural and heavy-duty applications)

DELIVERY METHODS & PRICING:
- Normal Delivery: Standard concrete truck delivery
- Pump Delivery: Concrete pump for hard-to-reach areas
- Tremie 1, 2, 3: Specialized delivery methods for underwater/difficult access

BUSINESS CONTEXT:
- Prices are in Malaysian Ringgit (RM) per cubic meter (m³)
- We serve the Malaysian construction market
- Focus on quality ready-mix concrete for various construction needs

${intentContext}

Current Product Context:
${productContext}

RESPONSE GUIDELINES:
1. Be knowledgeable about concrete grades, applications, and construction needs
2. Explain grade differences clearly (N-series for general use, S-series for structural)
3. Mention appropriate delivery methods based on customer needs
4. Provide pricing information when relevant
5. Ask clarifying questions about project requirements
6. Suggest suitable grades based on application type
7. Keep responses professional but conversational
8. Always consider Malaysian construction practices and standards
9. If discussing technical specifications, be accurate and helpful
10. Recommend appropriate volumes and delivery scheduling

Remember: You're helping customers choose the right concrete grade and delivery method for their specific construction projects.`;
}

// Enhanced intent-based product filtering
async function getProductsBasedOnIntent(
  intentAnalysis: any
): Promise<Product[]> {
  const { intent, extractedData } = intentAnalysis;
  let products: Product[] = [];

  if (
    extractedData.productType === "mortar" &&
    !extractedData.grade &&
    !extractedData.gradeRange
  ) {
    // Fetch all mortar products
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `
      )
      .eq("product_type", "mortar")
      .eq("is_active", true)
      .eq("status", "published")
      .gt("stock_quantity", 0)
      .order("is_featured", { ascending: false })
      .order("grade", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Mortar product search error:", error);
      return [];
    }
    return data || [];
  }

  switch (intent) {
    case "product_search":
      products = await searchProducts(
        extractedData.query || "",
        extractedData.grade,
        extractedData.gradeRange,
        extractedData.deliveryMethod,
        extractedData.priceRange
      );
      break;

    case "grade_inquiry":
      if (extractedData.grade) {
        products = await searchProducts("", extractedData.grade);
      } else if (extractedData.gradeRange) {
        products = await searchProducts(
          "",
          undefined,
          extractedData.gradeRange
        );
      } else {
        products = await getSmartRecommendations(extractedData);
      }
      break;

    case "price_inquiry":
      products = await searchProducts(
        extractedData.query || "",
        extractedData.grade,
        undefined,
        extractedData.deliveryMethod,
        extractedData.priceRange,
        8 // Show more options for price comparisons
      );
      break;

    case "recommendation":
    case "application_inquiry":
      products = await getSmartRecommendations(extractedData, 5);
      break;

    case "comparison_request":
      // Get products for comparison
      if (extractedData.grade) {
        // Get the specific grade plus similar ones
        products = await searchProducts("", extractedData.grade);
        const similarProducts = await getSmartRecommendations(extractedData, 3);
        products = [...products, ...similarProducts].slice(0, 6);
      } else {
        products = await getSmartRecommendations(extractedData, 4);
      }
      break;

    case "stock_inquiry":
      products = await searchProducts(
        extractedData.query || "",
        extractedData.grade
      );
      break;

    case "delivery_inquiry":
    case "technical_question":
      products = await searchProducts(
        extractedData.query || "",
        extractedData.grade
      );
      break;

    default:
      // General search or fallback
      if (extractedData.query && extractedData.query.length > 2) {
        products = await searchProducts(extractedData.query);
      } else {
        products = await getSmartRecommendations({}, 3);
      }
  }

  return products;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error:", authError);
    }

    // Use ConcreteIntentAnalyzer for better understanding
    const intentAnalysis = ConcreteIntentAnalyzer.analyzeIntent(message);
    console.log("Intent Analysis:", intentAnalysis);
    // Get products based on intent analysis
    let products: Product[] = [];
    let suggestions: string[] = [];

    // Only search for products if it's a construction-related query
    if (ConcreteIntentAnalyzer.isConstructionQuery(message)) {
      products = await getProductsBasedOnIntent(intentAnalysis);

      // Generate context-aware suggestions
      suggestions = ConcreteIntentAnalyzer.generateSuggestions(
        intentAnalysis.intent,
        intentAnalysis.extractedData
      );
    } else {
      // For non-construction queries, provide general suggestions
      suggestions = [
        "Browse our concrete grades",
        "N-series products (N10-N25)",
        "S-series products (S30-S45)",
        "Compare delivery methods",
      ];
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

    // Generate enhanced system prompt
    const systemPrompt = generateSystemPrompt(products, intentAnalysis);

    // Initialize Gemini model - using the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the full prompt with intent-aware context
    const fullPrompt = `${systemPrompt}

Conversation History:
${conversationContext}

Customer: ${message}

Based on the intent analysis, please provide a helpful and informed response. ${
      products.length > 0
        ? "Reference the provided products naturally in your response where relevant."
        : "If no specific products match the query, provide general guidance about our concrete grades and services."
    } 

Keep the response conversational and focused on helping the customer make informed decisions about their concrete needs.`;

    // Generate response using Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Prepare response data with enhanced metadata
    const responseData = {
      message: aiResponse,
      type: products.length > 0 ? "product" : "text",
      metadata: {
        ...(products.length > 0 && { products }),
        ...(suggestions.length > 0 && { suggestions }),
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence,
        extractedData: intentAnalysis.extractedData,
        isConstructionQuery:
          ConcreteIntentAnalyzer.isConstructionQuery(message),
      },
    };

    if (
      intentAnalysis.intent === "cart_show" ||
      (typeof message === "string" && /show.*cart/i.test(message))
    ) {
      if (!user?.id) {
        return NextResponse.json({
          message: "Please login to view your cart.",
          type: "cart",
          metadata: { cart: [] },
        });
      }
      const cartItems = await getCartItemsServerSide(user.id);
      return NextResponse.json({
        message: cartItems.length
          ? "Here are the items in your cart:"
          : "Your cart is empty.",
        type: "cart",
        metadata: { cart: cartItems },
      });
    }

    // Remove item from cart
    const removeMatch =
      typeof message === "string" &&
      message.match(/remove\s+([a-zA-Z0-9\s]+)\s+from.*cart/i);
    if (removeMatch && user?.id) {
      const productName = removeMatch[1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      const cartItems = await getCartItemsServerSide(user.id);
      const item = cartItems.find(
        (ci) =>
          ci.product?.name?.toLowerCase().replace(/\s+/g, " ") === productName
      );
      if (item) {
        await removeFromCartServerSide(item.id);
        // Add cartUpdated flag
        return NextResponse.json({
          message: `Removed ${item.product.name} from your cart.`,
          type: "cart",
          metadata: { cart: await getCartItemsServerSide(user.id) },
          cartUpdated: true,
        });
      } else {
        return NextResponse.json({
          message: `Could not find ${productName} in your cart.`,
          type: "cart",
          metadata: { cart: cartItems },
        });
      }
    }

    // Remove by cart item id
    if (
      typeof message === "string" &&
      message.startsWith("remove_cart_item_id:")
    ) {
      const itemId = message.replace("remove_cart_item_id:", "").trim();
      if (user?.id && itemId) {
        await removeFromCartServerSide(itemId);
        return NextResponse.json({
          message: "Removed item from your cart.",
          type: "cart",
          metadata: { cart: await getCartItemsServerSide(user.id) },
          cartUpdated: true,
        });
      }
    }

    // Update quantity in cart
    const updateMatch =
      typeof message === "string" &&
      message.match(/update\s+quantity\s+of\s+([a-zA-Z0-9\s]+)\s+to\s+(\d+)/i);
    if (updateMatch && user?.id) {
      const productName = updateMatch[1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      const newQty = parseInt(updateMatch[2]);
      const cartItems = await getCartItemsServerSide(user.id);
      const item = cartItems.find(
        (ci) =>
          ci.product?.name?.toLowerCase().replace(/\s+/g, " ") === productName
      );
      if (item) {
        await updateCartItemQuantityServerSide(item.id, newQty);
        // Add cartUpdated flag
        return NextResponse.json({
          message: `Updated quantity of ${item.product.name} to ${newQty}.`,
          type: "cart",
          metadata: { cart: await getCartItemsServerSide(user.id) },
          cartUpdated: true,
        });
      } else {
        return NextResponse.json({
          message: `Could not find ${productName} in your cart.`,
          type: "cart",
          metadata: { cart: cartItems },
        });
      }
    }

    // Conversational Order Tracking
    if (
      intentAnalysis.intent === "order_status" ||
      (typeof message === "string" &&
        /(order status|track order|my orders|recent orders|order history|show my orders|show recent orders|where is my order|show order)/i.test(
          message
        ))
    ) {
      if (!user?.id) {
        return NextResponse.json({
          message: "Please login to view your orders.",
          type: "order",
          metadata: { orders: [] },
        });
      }
      const orders = await getRecentOrdersServerSide(user.id, 5);
      console.log("Order debug:", { userId: user.id, orders });
      return NextResponse.json({
        message: orders.length
          ? "Here are your recent orders:"
          : "You have no recent orders.",
        type: "order",
        metadata: { orders },
      });
    }

    return NextResponse.json(responseData);
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
