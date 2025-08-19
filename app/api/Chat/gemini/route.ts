/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
  stock_quantity?: number;
}

// Product search function using Supabase
async function searchProducts(query: string, limit = 5): Promise<Product[]> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image, category, description, stock_quantity")
      .or(
        `name.ilike.%${query}%, description.ilike.%${query}%, category.ilike.%${query}%`
      )
      .gt("stock_quantity", 0) // Only show products in stock
      .limit(limit);

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

// Get product recommendations based on category or user preferences
async function getRecommendations(
  category?: string,
  limit = 3
): Promise<Product[]> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    let query = supabase
      .from("products")
      .select("id, name, price, image, category, description, stock_quantity")
      .gt("stock_quantity", 0)
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

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

// Generate system prompt with product context
function generateSystemPrompt(products: Product[]): string {
  const productContext =
    products.length > 0
      ? `Here are some relevant products from our catalog:\n${products
          .map(
            (p) => `- ${p.name}: $${p.price} (${p.category}) - ${p.description}`
          )
          .join("\n")}`
      : "No specific products found for this query.";

  return `You are an AI shopping assistant for an e-commerce store. You help customers find products, answer questions about inventory, and provide personalized recommendations.

Guidelines:
- Be helpful, friendly, and conversational
- Provide specific product recommendations when appropriate
- If you mention products, use the product data provided
- Ask clarifying questions to better understand customer needs
- Suggest related or complementary products
- Provide brief, clear explanations about product features
- If a customer asks about price ranges, sizing, or availability, refer to the product data
- Keep responses concise but informative

Current Product Context:
${productContext}

Remember to be natural and conversational while being helpful with product discovery and recommendations.`;
}

// Analyze user intent to determine if product search is needed
function analyzeIntent(message: string): {
  needsProductSearch: boolean;
  searchQuery?: string;
  category?: string;
  intent:
    | "product_search"
    | "general_question"
    | "recommendation"
    | "price_inquiry"
    | "other";
} {
  const lowerMessage = message.toLowerCase();

  // Product search keywords
  const searchKeywords = [
    "find",
    "show",
    "looking for",
    "need",
    "want",
    "search",
    "browse",
  ];
  const productKeywords = [
    "product",
    "item",
    "clothing",
    "shoes",
    "accessories",
    "electronics",
  ];

  // Price inquiry keywords
  const priceKeywords = [
    "price",
    "cost",
    "how much",
    "expensive",
    "cheap",
    "budget",
    "$",
  ];

  // Recommendation keywords
  const recommendationKeywords = [
    "recommend",
    "suggest",
    "best",
    "popular",
    "trending",
  ];

  const needsProductSearch =
    searchKeywords.some((keyword) => lowerMessage.includes(keyword)) ||
    productKeywords.some((keyword) => lowerMessage.includes(keyword));

  let intent:
    | "product_search"
    | "general_question"
    | "recommendation"
    | "price_inquiry"
    | "other" = "other";

  if (
    recommendationKeywords.some((keyword) => lowerMessage.includes(keyword))
  ) {
    intent = "recommendation";
  } else if (priceKeywords.some((keyword) => lowerMessage.includes(keyword))) {
    intent = "price_inquiry";
  } else if (needsProductSearch) {
    intent = "product_search";
  } else {
    intent = "general_question";
  }

  // Extract search query (simplified - could be improved with NLP)
  let searchQuery = message;
  searchKeywords.forEach((keyword) => {
    if (lowerMessage.includes(keyword)) {
      const index = lowerMessage.indexOf(keyword);
      searchQuery = message.substring(index + keyword.length).trim();
    }
  });

  return {
    needsProductSearch: needsProductSearch || intent === "recommendation",
    searchQuery: searchQuery || message,
    intent,
  };
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

    // Analyze user intent
    const analysis = analyzeIntent(message);
    let products: Product[] = [];
    let suggestions: string[] = [];

    // Search for products if needed
    if (analysis.needsProductSearch && analysis.searchQuery) {
      products = await searchProducts(analysis.searchQuery);

      // If no products found, try broader search or recommendations
      if (products.length === 0 && analysis.intent === "product_search") {
        products = await getRecommendations();
        suggestions = [
          "Show me electronics",
          "Browse clothing",
          "What's popular?",
        ];
      }
    } else if (analysis.intent === "recommendation") {
      products = await getRecommendations();
      suggestions = ["Show me more", "Different category", "Price range?"];
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

    // Generate system prompt with product context
    const systemPrompt = generateSystemPrompt(products);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the full prompt
    const fullPrompt = `${systemPrompt}

Conversation History:
${conversationContext}

Customer: ${message}

Please provide a helpful response. If you're mentioning specific products, reference them naturally in your response.`;

    // Generate response using Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Prepare response data
    const responseData = {
      message: aiResponse,
      type: products.length > 0 ? "product" : "text",
      metadata: {
        ...(products.length > 0 && { products }),
        ...(suggestions.length > 0 && { suggestions }),
        intent: analysis.intent,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Gemini API error:", error);

    return NextResponse.json(
      {
        message:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        type: "error",
      },
      { status: 500 }
    );
  }
}
