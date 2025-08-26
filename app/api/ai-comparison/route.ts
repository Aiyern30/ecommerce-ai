// app/api/ai-comparison/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  GenerationConfig,
  HarmCategory,
  SafetySetting,
  HarmBlockThreshold,
} from "@google/generative-ai";

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
  selectedPriceType?: string;
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

// Optimized generation config for speed
const generationConfig: GenerationConfig = {
  temperature: 0.3, // Lower for faster, more consistent responses
  topK: 20, // Reduced for speed
  topP: 0.8, // Lower for speed
  maxOutputTokens: 1500, // Reduced significantly for speed
  responseMimeType: "text/plain",
};

// Minimal safety settings for speed
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Quick validation
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.products)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { products }: { products: Product[] } = body;

    // Quick validation
    if (products.length < 2 || products.length > 4) {
      // Limit to 4 for speed
      return NextResponse.json(
        { error: "2-4 products required for comparison" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 500 }
      );
    }

    console.log(`Starting fast AI analysis for ${products.length} products`);

    // Set aggressive timeout for Vercel free tier
    const aiResult = await Promise.race([
      generateFastAIAnalysis(products),
      new Promise<AIComparisonResult>(
        (_, reject) => setTimeout(() => reject(new Error("timeout")), 7000) // 7 seconds max
      ),
    ]).catch(() => {
      console.log("AI analysis timed out, using fallback");
      return createFallbackResponse(products);
    });

    const processingTime = Date.now() - startTime;
    console.log(`Analysis completed in ${processingTime}ms`);

    return NextResponse.json({
      ...aiResult,
      metadata: {
        processingTimeMs: processingTime,
        productsAnalyzed: products.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI Comparison Error:", error);

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

async function generateFastAIAnalysis(
  products: Product[]
): Promise<AIComparisonResult> {
  try {
    // Use fastest model with minimal config
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig,
      safetySettings,
    });

    console.log("Sending request to Gemini API...");

    const result = await model.generateContent(createOptimizedPrompt(products));
    const response = await result.response;
    const text = response.text();

    console.log("Received response from Gemini API");

    if (!text || text.trim().length < 20) {
      console.log("Empty or short response, using fallback");
      return createFallbackResponse(products);
    }

    return parseAIResponse(text, products);
  } catch (error) {
    console.log("Gemini API error, using fallback:", error);
    return createFallbackResponse(products);
  }
}

function createOptimizedPrompt(products: Product[]): string {
  // Simplified product details for faster processing
  const productSummary = products
    .map((product, i) => {
      const price =
        product.normal_price ||
        product.pump_price ||
        product.tremie_1_price ||
        "N/A";

      return `${i + 1}. ${product.name} - Grade ${product.grade}, RM${price}/${
        product.unit || "unit"
      }, Stock: ${product.stock_quantity || "N/A"}`;
    })
    .join("\n");

  // Much shorter, focused prompt for speed
  return `Compare these ${products.length} construction materials quickly:

${productSummary}

Respond with ONLY this JSON format:
{
  "summary": "Brief 2-sentence comparison highlighting key differences and value",
  "keyDifferences": ["3-4 key differences in grade, price, and application"],
  "recommendations": ["3-4 specific recommendations mentioning product names"],
  "useCases": [{"product": "Product name", "useCase": "Best application", "reason": "Why suitable"}],
  "costAnalysis": "Brief cost comparison and value assessment",
  "insights": [
    {"type": "tip", "title": "Quick tip", "content": "Practical advice", "icon": "lightbulb"},
    {"type": "analysis", "title": "Key insight", "content": "Technical insight", "icon": "brain"}
  ]
}

Focus on: grades (N15-N30), prices, construction applications. Keep responses concise. JSON only.`;
}

function parseAIResponse(
  text: string,
  products: Product[]
): AIComparisonResult {
  try {
    // Extract JSON more aggressively
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return createFallbackResponse(products);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Quick validation and sanitization
    const result: AIComparisonResult = {
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : `Comparison of ${products.length} construction materials with varying grades and prices.`,
      keyDifferences: Array.isArray(parsed.keyDifferences)
        ? parsed.keyDifferences.slice(0, 4)
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 4)
        : [],
      useCases: Array.isArray(parsed.useCases)
        ? parsed.useCases.slice(0, products.length)
        : [],
      costAnalysis:
        typeof parsed.costAnalysis === "string"
          ? parsed.costAnalysis
          : "Cost analysis unavailable.",
      insights: Array.isArray(parsed.insights)
        ? parsed.insights.slice(0, 3)
        : [],
    };

    // Ensure minimum content
    if (result.keyDifferences.length === 0) {
      result.keyDifferences = generateQuickDifferences(products);
    }
    if (result.recommendations.length === 0) {
      result.recommendations = generateQuickRecommendations(products);
    }

    return result;
  } catch {
    console.log("JSON parsing failed, using fallback");
    return createFallbackResponse(products);
  }
}

function createFallbackResponse(products: Product[]): AIComparisonResult {
  const prices = products
    .map((p) => parseFloat(p.normal_price || p.pump_price || "0"))
    .filter((p) => p > 0);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const grades = [...new Set(products.map((p) => p.grade))];

  return {
    summary: `Comparing ${products.length} materials with grades ${grades.join(
      ", "
    )} and prices RM${minPrice}-${maxPrice}. Each offers distinct advantages for different construction applications.`,
    keyDifferences: generateQuickDifferences(products),
    recommendations: generateQuickRecommendations(products),
    useCases: generateQuickUseCases(products),
    costAnalysis: `Price range: RM${minPrice}-${maxPrice}. Higher grades offer better strength but cost more. Consider project requirements vs budget.`,
    insights: [
      {
        type: "tip",
        title: "Grade Selection",
        content:
          "Higher grades (N25+) for structural, N20 for general use saves 15-20% costs.",
        icon: "lightbulb",
      },
      {
        type: "analysis",
        title: "Cost vs Performance",
        content:
          "Balance grade requirements with budget. Overspecifying wastes money.",
        icon: "brain",
      },
    ],
  };
}

function generateQuickDifferences(products: Product[]): string[] {
  const diffs = [];

  const grades = [...new Set(products.map((p) => p.grade))];
  if (grades.length > 1) {
    diffs.push(
      `Grade variations: ${grades.join(", ")} affecting strength capacity`
    );
  }

  const prices = products
    .map((p) => parseFloat(p.normal_price || "0"))
    .filter((p) => p > 0);
  if (prices.length > 1) {
    diffs.push(
      `Price range: RM${Math.min(...prices)}-${Math.max(
        ...prices
      )} per cubic meter`
    );
  }

  diffs.push(
    "Different delivery methods available (normal, pump, tremie) affecting cost"
  );
  diffs.push("Stock availability varies affecting project scheduling");

  return diffs.slice(0, 4);
}

function generateQuickRecommendations(products: Product[]): string[] {
  const recs = [];

  // Find highest grade
  const highGrade = products.reduce((prev, curr) =>
    parseInt(curr.grade.replace("N", "")) >
    parseInt(prev.grade.replace("N", ""))
      ? curr
      : prev
  );

  recs.push(
    `For structural work, choose "${highGrade.name}" with ${highGrade.grade} grade`
  );

  // Find cheapest
  const cheapest = products.reduce((prev, curr) => {
    const prevPrice = parseFloat(prev.normal_price || "999999");
    const currPrice = parseFloat(curr.normal_price || "999999");
    return currPrice < prevPrice ? curr : prev;
  });

  recs.push(
    `For budget projects, "${cheapest.name}" offers best value at RM${cheapest.normal_price}`
  );

  recs.push(
    "Consider pump concrete for multi-story buildings to reduce labor costs"
  );
  recs.push("Check stock levels before finalizing orders to avoid delays");

  return recs.slice(0, 4);
}

function generateQuickUseCases(
  products: Product[]
): Array<{ product: string; useCase: string; reason: string }> {
  return products.slice(0, 3).map((product) => {
    const grade = parseInt(product.grade.replace("N", ""));

    if (grade >= 25) {
      return {
        product: product.name,
        useCase: "Structural elements (beams, columns)",
        reason: `${product.grade} grade provides high compressive strength for load-bearing`,
      };
    } else if (grade >= 20) {
      return {
        product: product.name,
        useCase: "Residential slabs and foundations",
        reason: `${product.grade} grade balances strength and cost for residential use`,
      };
    } else {
      return {
        product: product.name,
        useCase: "Driveways and non-structural work",
        reason: `${product.grade} grade is economical for non-load bearing applications`,
      };
    }
  });
}
