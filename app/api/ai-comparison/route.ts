// app/api/ai-comparison/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI (you can also use Vertex AI SDK if preferred)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

interface Product {
  id: string;
  name: string;
  description: string | null;
  grade: string;
  product_type: "concrete" | "mortar";
  mortar_ratio: string | null;
  category: string | null;
  normal_price: string | null;
  pump_price: string | null;
  tremie_1_price: string | null;
  tremie_2_price: string | null;
  tremie_3_price: string | null;
  unit: string | null;
  stock_quantity: number | null;
  keywords: string[] | null;
}

interface AIInsight {
  type: "recommendation" | "analysis" | "warning" | "tip";
  title: string;
  content: string;
  icon: "brain" | "lightbulb" | "trending" | "alert";
}

interface AIComparisonResult {
  summary: string;
  keyDifferences: string[];
  recommendations: string[];
  useCases: { product: string; useCase: string; reason: string }[];
  costAnalysis: string;
  insights: AIInsight[];
}

export async function POST(request: NextRequest) {
  try {
    const { products }: { products: Product[] } = await request.json();

    if (!products || products.length < 2) {
      return NextResponse.json(
        { error: "At least 2 products are required for comparison" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google AI API key is not configured" },
        { status: 500 }
      );
    }

    // Create the prompt for AI analysis
    const prompt = createComparisonPrompt(products);

    // Try primary model first
    let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let result, response, text;
    try {
      result = await model.generateContent(prompt);
      response = await result.response;
      text = response.text();
    } catch (err) {
      // If error (quota/rate limit), fallback to another model
      console.warn("gemini-1.5-flash failed, trying gemini-pro", err);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
      try {
        result = await model.generateContent(prompt);
        response = await result.response;
        text = response.text();
      } catch (err2) {
        console.error("All Gemini models failed", err2);
        return NextResponse.json(
          { error: "AI quota exceeded or all models failed" },
          { status: 429 }
        );
      }
    }

    // Parse the AI response
    const aiResult = parseAIResponse(text, products);

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("AI Comparison Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI comparison" },
      { status: 500 }
    );
  }
}

function createComparisonPrompt(products: Product[]): string {
  const productDetails = products
    .map(
      (product, index) =>
        `Product ${index + 1}: ${product.name}
    - Grade: ${product.grade}
    - Type: ${product.product_type}
    - Category: ${product.category || "N/A"}
    - Description: ${product.description || "No description"}
    - Normal Price: RM ${product.normal_price || "N/A"} ${product.unit || ""}
    - Pump Price: RM ${product.pump_price || "N/A"} ${product.unit || ""}
    - Stock: ${product.stock_quantity || "N/A"} units
    - Keywords: ${product.keywords?.join(", ") || "None"}
    - Mortar Ratio: ${product.mortar_ratio || "N/A"}`
    )
    .join("\n\n");

  const productNames = products.map((p) => p.name).join(", ");

  return `You are an expert construction materials advisor. Analyze and compare these concrete/mortar products:

${productDetails}

Provide a comprehensive comparison analysis in the following JSON format:

{
  "summary": "Brief 2-3 sentence overview of the comparison highlighting the main distinctions",
  "keyDifferences": [
    "List 3-5 key differences between the products",
    "Focus on grade, price, applications, and technical aspects"
  ],
  "recommendations": [
    "3-4 specific recommendations for choosing between these products",
    "At least one recommendation must clearly mention and recommend a specific product from the compared products: [${productNames}]",
    "Consider cost-effectiveness, application suitability, and performance"
  ],
  "useCases": [
    {
      "product": "Product Name",
      "useCase": "Specific use case or application",
      "reason": "Why this product is best for this use case"
    }
  ],
  "costAnalysis": "Analysis of cost differences and value proposition for each product",
  "insights": [
    {
      "type": "recommendation|analysis|warning|tip",
      "title": "Insight Title",
      "content": "Detailed insight content",
      "icon": "brain|lightbulb|trending|alert"
    }
  ]
}

Guidelines:
- Focus on practical construction applications
- Consider Malaysian construction standards and practices
- Highlight grade differences (N20, N25, etc.) and their structural implications
- Analyze price points for different delivery methods (normal, pump, tremie)
- Consider stock availability in recommendations
- Use technical but accessible language
- Provide actionable insights for contractors and builders
- Always recommend at least one product from the compared products in the recommendations section

Respond only with valid JSON format.`;
}

function parseAIResponse(
  text: string,
  products: Product[]
): AIComparisonResult {
  try {
    // Clean the response text to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    // Validate and ensure all required fields exist
    const result: AIComparisonResult = {
      summary:
        parsed.summary || "AI analysis completed for the selected products.",
      keyDifferences: Array.isArray(parsed.keyDifferences)
        ? parsed.keyDifferences
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      useCases: Array.isArray(parsed.useCases) ? parsed.useCases : [],
      costAnalysis: parsed.costAnalysis || "Cost analysis not available.",
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
    };

    // Ensure at least one recommendation mentions a compared product
    const productNames = products.map((p) => p.name);
    const hasProductRecommendation = result.recommendations.some((rec) =>
      productNames.some((name) =>
        rec.toLowerCase().includes(name.toLowerCase())
      )
    );
    if (!hasProductRecommendation && productNames.length > 0) {
      // Add a fallback recommendation for the first product
      result.recommendations.unshift(
        `Based on the analysis, "${productNames[0]}" is recommended for most users due to its balance of price, grade, and availability.`
      );
    }

    return result;
  } catch (error) {
    console.error("Failed to parse AI response:", error);

    // Fallback response if parsing fails
    return createFallbackResponse(products);
  }
}

function createFallbackResponse(products: Product[]): AIComparisonResult {
  const grades = products.map((p) => p.grade).filter(Boolean);
  const prices = products
    .map((p) => parseFloat(p.normal_price || "0"))
    .filter((p) => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    summary: `Comparing ${
      products.length
    } concrete products with grades ranging from ${Math.min(
      ...grades.map((g) => parseInt(g.replace("N", "")))
    )} to ${Math.max(
      ...grades.map((g) => parseInt(g.replace("N", "")))
    )} MPa, with prices from RM${minPrice.toFixed(0)} to RM${maxPrice.toFixed(
      0
    )}.`,
    keyDifferences: [
      "Different concrete grades indicating varying strength levels",
      "Price variations based on strength and delivery method",
      "Different applications based on structural requirements",
    ],
    recommendations: [
      "Choose higher grade concrete for structural elements like columns and beams",
      "Consider pump prices for high-rise construction projects",
      "Evaluate stock quantities for project timeline planning",
    ],
    useCases: products.map((product) => ({
      product: product.name,
      useCase:
        product.grade === "N25"
          ? "Structural construction"
          : "General construction",
      reason: `${product.grade} grade concrete is suitable for ${
        product.description?.toLowerCase() ||
        "various construction applications"
      }`,
    })),
    costAnalysis: `Price range varies from RM${minPrice.toFixed(
      0
    )} to RM${maxPrice.toFixed(
      0
    )} per cubic meter. Higher grades typically cost more due to increased cement content and strength requirements.`,
    insights: [
      {
        type: "tip",
        title: "Grade Selection",
        content:
          "Higher grade concrete (N25+) is recommended for structural elements, while N20 is suitable for general construction like driveways and floors.",
        icon: "lightbulb",
      },
      {
        type: "analysis",
        title: "Cost Consideration",
        content:
          "Pump concrete costs 2-3% more than normal concrete but can significantly reduce labor costs and construction time for multi-story buildings.",
        icon: "trending",
      },
    ],
  };
}
