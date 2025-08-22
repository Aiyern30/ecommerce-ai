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

const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
  responseMimeType: "text/plain",
};

// Safety settings with correct enum values
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate request
    const body = await request.json().catch(() => null);
    if (!body || !body.products) {
      return NextResponse.json(
        { error: "Invalid request format. Expected { products: Product[] }" },
        { status: 400 }
      );
    }

    const { products }: { products: Product[] } = body;

    // Validate products array
    if (!Array.isArray(products) || products.length < 2) {
      return NextResponse.json(
        { error: "At least 2 products are required for comparison" },
        { status: 400 }
      );
    }

    if (products.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 products allowed for comparison" },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("Google AI API key is not configured");
      return NextResponse.json(
        { error: "AI service is temporarily unavailable" },
        { status: 500 }
      );
    }

    // Validate products have required fields
    for (const product of products) {
      if (!product.name || !product.id || !product.grade) {
        return NextResponse.json(
          {
            error:
              "Invalid product data. Missing required fields (name, id, grade)",
          },
          { status: 400 }
        );
      }
    }

    console.log(`Starting AI analysis for ${products.length} products`);

    // Generate AI analysis with enhanced error handling
    const aiResult = await generateAIAnalysis(products);

    const processingTime = Date.now() - startTime;
    console.log(`AI analysis completed in ${processingTime}ms`);

    return NextResponse.json({
      ...aiResult,
      metadata: {
        processingTimeMs: processingTime,
        productsAnalyzed: products.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("AI Comparison Error:", error);
    console.log(`Request failed after ${processingTime}ms`);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "AI service quota exceeded. Please try again later." },
          { status: 429 }
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error:
              "AI analysis timed out. Please try again with fewer products.",
          },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate AI comparison. Please try again." },
      { status: 500 }
    );
  }
}

async function generateAIAnalysis(
  products: Product[]
): Promise<AIComparisonResult> {
  const prompt = createComparisonPrompt(products);

  const models = [
    {
      name: "gemini-1.5-flash",
      config: { ...generationConfig, maxOutputTokens: 4096 },
    },
    {
      name: "gemini-1.5-pro",
      config: { ...generationConfig, maxOutputTokens: 8192 },
    },
    // Removed gemini-pro (not supported for generateContent in v1beta)
  ];

  for (const modelInfo of models) {
    try {
      console.log(`Attempting analysis with ${modelInfo.name}`);

      const model = genAI.getGenerativeModel({
        model: modelInfo.name,
        generationConfig: modelInfo.config,
        safetySettings,
      });

      // Reduce timeout to 8000ms (8 seconds)
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 8000)
        ),
      ]);

      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length < 50) {
        throw new Error("AI response too short or empty");
      }

      console.log(`Successfully generated response with ${modelInfo.name}`);
      return parseAIResponse(text, products);
    } catch (error) {
      console.warn(
        `${modelInfo.name} failed:`,
        error instanceof Error ? error.message : error
      );

      // If it's a quota/rate limit error, don't try other models
      if (
        error instanceof Error &&
        (error.message.includes("quota") ||
          error.message.includes("rate") ||
          error.message.includes("limit"))
      ) {
        throw error;
      }

      // Continue to next model for other errors
      continue;
    }
  }

  // If all models failed or timed out, return fallback immediately
  return createFallbackResponse(products);
}

function createComparisonPrompt(products: Product[]): string {
  const productDetails = products
    .map((product, index) => {
      // Get selected price and label
      let price: string | null = null;
      let label: string = "";
      let allPrices: string[] = [];

      // Build price information
      const priceTypes = [
        { key: "normal", price: product.normal_price, label: "Normal Price" },
        { key: "pump", price: product.pump_price, label: "Pump Price" },
        {
          key: "tremie_1",
          price: product.tremie_1_price,
          label: "Tremie 1 Price",
        },
        {
          key: "tremie_2",
          price: product.tremie_2_price,
          label: "Tremie 2 Price",
        },
        {
          key: "tremie_3",
          price: product.tremie_3_price,
          label: "Tremie 3 Price",
        },
      ];

      // Get selected price
      const selectedPriceType = priceTypes.find(
        (pt) => pt.key === product.selectedPriceType
      );
      if (selectedPriceType && selectedPriceType.price) {
        price = selectedPriceType.price;
        label = selectedPriceType.label;
      } else {
        // Fallback to normal price
        const normalPrice = priceTypes.find((pt) => pt.key === "normal");
        if (normalPrice && normalPrice.price) {
          price = normalPrice.price;
          label = normalPrice.label;
        }
      }

      // Get all available prices for context
      allPrices = priceTypes
        .filter((pt) => pt.price && parseFloat(pt.price) > 0)
        .map((pt) => `${pt.label}: RM ${pt.price}`);

      return `Product ${index + 1}: ${product.name}
    - Grade: ${product.grade}
    - Type: ${product.product_type}
    - Category: ${product.category || "Construction Material"}
    - Description: ${
      product.description || "High-quality construction material"
    }
    - Selected Price (${label}): RM ${price || "N/A"} per ${
        product.unit || "unit"
      }
    - All Available Prices: ${
      allPrices.length > 0
        ? allPrices.join(", ")
        : "Price information not available"
    }
    - Stock: ${product.stock_quantity || "N/A"} units
    - Keywords: ${product.keywords?.join(", ") || "None"}
    - Mortar Ratio: ${product.mortar_ratio || "N/A"}`;
    })
    .join("\n\n");

  const productNames = products.map((p) => p.name).join(", ");
  const productCount = products.length;

  return `You are an expert construction materials consultant specializing in Malaysian construction standards and practices. Analyze and compare these ${productCount} concrete/mortar products for construction professionals:

${productDetails}

Provide a comprehensive comparison analysis in the following JSON format. Ensure the response is valid JSON and follows this exact structure:

{
  "summary": "Write a detailed 3-4 sentence overview highlighting the main distinctions between these products, focusing on their grades, applications, and value propositions.",
  "keyDifferences": [
    "List 4-6 key technical differences between the products",
    "Include grade differences and their structural implications",
    "Mention price variations and delivery method differences",
    "Highlight performance characteristics and applications"
  ],
  "recommendations": [
    "Provide 4-5 specific, actionable recommendations for choosing between these products",
    "At least 2 recommendations must clearly mention and recommend specific products from: [${productNames}]",
    "Consider cost-effectiveness, application suitability, and performance",
    "Include recommendations for different project types and budgets"
  ],
  "useCases": [
    {
      "product": "Exact product name from the list",
      "useCase": "Specific construction application or project type",
      "reason": "Detailed explanation of why this product excels in this application"
    }
  ],
  "costAnalysis": "Provide a detailed analysis of cost differences, value proposition for each product, and recommendations for budget-conscious decisions. Include analysis of delivery method costs and their impact on total project cost.",
  "insights": [
    {
      "type": "recommendation",
      "title": "Professional recommendation title",
      "content": "Detailed professional insight about product selection",
      "icon": "lightbulb"
    },
    {
      "type": "analysis",
      "title": "Technical analysis title", 
      "content": "Technical comparison insight",
      "icon": "brain"
    },
    {
      "type": "tip",
      "title": "Construction tip title",
      "content": "Practical construction advice",
      "icon": "trending"
    }
  ]
}

Analysis Guidelines:
- Focus on Malaysian construction standards (MS standards where applicable)
- Consider tropical climate conditions and their impact on material selection
- Analyze grade differences (N15, N20, N25, N30, etc.) and their structural applications
- Compare delivery methods (normal, pump, tremie) and their cost-benefit analysis
- Consider stock availability and project timeline implications
- Use technical but accessible language for construction professionals
- Provide actionable insights for contractors, architects, and builders
- Include safety considerations and quality standards
- Consider environmental factors and sustainability where relevant
- Always recommend at least 2 specific products from the compared list

Important: Respond with ONLY valid JSON. Do not include any text before or after the JSON object.`;
}

function parseAIResponse(
  text: string,
  products: Product[]
): AIComparisonResult {
  try {
    // Clean the response text to extract JSON
    let cleanedText = text.trim();

    // Remove common prefixes/suffixes that might break JSON parsing
    cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");

    // Find the JSON object
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response");
      return createFallbackResponse(products);
    }

    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    // Validate and sanitize the parsed response
    const result: AIComparisonResult = {
      summary:
        typeof parsed.summary === "string" && parsed.summary.length > 0
          ? parsed.summary
          : `Comparison analysis of ${products.length} construction materials completed.`,
      keyDifferences: Array.isArray(parsed.keyDifferences)
        ? parsed.keyDifferences.filter(
            (diff: string) => typeof diff === "string" && diff.length > 0
          )
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter(
            (rec: string) => typeof rec === "string" && rec.length > 0
          )
        : [],
      useCases: Array.isArray(parsed.useCases)
        ? parsed.useCases.filter(
            (useCase: { product: string; useCase: string; reason: string }) =>
              useCase &&
              typeof useCase.product === "string" &&
              typeof useCase.useCase === "string" &&
              typeof useCase.reason === "string"
          )
        : [],
      costAnalysis:
        typeof parsed.costAnalysis === "string" &&
        parsed.costAnalysis.length > 0
          ? parsed.costAnalysis
          : "Cost analysis not available.",
      insights: Array.isArray(parsed.insights)
        ? parsed.insights.filter(
            (insight: AIInsight) =>
              insight &&
              typeof insight.type === "string" &&
              typeof insight.title === "string" &&
              typeof insight.content === "string" &&
              typeof insight.icon === "string" &&
              ["recommendation", "analysis", "warning", "tip"].includes(
                insight.type
              ) &&
              ["brain", "lightbulb", "trending", "alert"].includes(insight.icon)
          )
        : [],
    };

    // Ensure quality of response
    if (result.keyDifferences.length === 0) {
      result.keyDifferences = generateFallbackDifferences(products);
    }

    if (result.recommendations.length === 0) {
      result.recommendations = generateFallbackRecommendations(products);
    }

    if (result.useCases.length === 0) {
      result.useCases = generateFallbackUseCases(products);
    }

    if (result.insights.length === 0) {
      result.insights = generateFallbackInsights();
    }

    // Ensure at least one recommendation mentions a compared product
    const productNames = products.map((p) => p.name.toLowerCase());
    const hasProductRecommendation = result.recommendations.some((rec) =>
      productNames.some((name) => rec.toLowerCase().includes(name))
    );

    if (!hasProductRecommendation && products.length > 0) {
      const firstProduct = products[0];
      result.recommendations.unshift(
        `Based on our analysis, "${
          firstProduct.name
        }" offers excellent value with its ${
          firstProduct.grade
        } grade concrete, making it suitable for ${
          firstProduct.product_type === "concrete"
            ? "structural applications"
            : "general construction work"
        }.`
      );
    }

    console.log(
      `Successfully parsed AI response with ${result.keyDifferences.length} differences, ${result.recommendations.length} recommendations`
    );
    return result;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.log("Raw AI response:", text.substring(0, 500) + "...");
    return createFallbackResponse(products);
  }
}

function createFallbackResponse(products: Product[]): AIComparisonResult {
  console.log(
    "Creating fallback response for products:",
    products.map((p) => p.name)
  );

  const prices = products
    .map((p) => {
      switch (p.selectedPriceType) {
        case "pump":
          return parseFloat(p.pump_price || "0");
        case "tremie_1":
          return parseFloat(p.tremie_1_price || "0");
        case "tremie_2":
          return parseFloat(p.tremie_2_price || "0");
        case "tremie_3":
          return parseFloat(p.tremie_3_price || "0");
        default:
          return parseFloat(p.normal_price || "0");
      }
    })
    .filter((p) => p > 0);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : 0;

  const grades = [...new Set(products.map((p) => p.grade))];
  const types = [...new Set(products.map((p) => p.product_type))];

  return {
    summary: `Comparing ${
      products.length
    } construction materials with grades ranging from ${grades.join(
      ", "
    )} and prices from RM${minPrice.toFixed(0)} to RM${maxPrice.toFixed(
      0
    )}. The analysis covers ${types.join(
      " and "
    )} products suitable for various construction applications in Malaysian building standards.`,
    keyDifferences: generateFallbackDifferences(products),
    recommendations: generateFallbackRecommendations(products),
    useCases: generateFallbackUseCases(products),
    costAnalysis: `Price analysis shows a range from RM${minPrice.toFixed(
      0
    )} to RM${maxPrice.toFixed(
      0
    )} per cubic meter, with an average of RM${avgPrice.toFixed(
      0
    )}. Higher-grade products (${grades
      .filter((g) => parseInt(g.replace("N", "")) > 20)
      .join(
        ", "
      )}) command premium pricing but offer superior strength for structural applications. Delivery method selection can impact total project costs by 10-15%.`,
    insights: generateFallbackInsights(),
  };
}

function generateFallbackDifferences(products: Product[]): string[] {
  const differences = [];

  const grades = [...new Set(products.map((p) => p.grade))];
  if (grades.length > 1) {
    differences.push(
      `Grade variations: ${grades.join(
        ", "
      )} - higher grades provide increased compressive strength`
    );
  }

  const priceRange = products
    .map((p) => parseFloat(p.normal_price || "0"))
    .filter((p) => p > 0);
  if (priceRange.length > 1) {
    differences.push(
      `Price range from RM${Math.min(...priceRange)} to RM${Math.max(
        ...priceRange
      )} affects budget considerations`
    );
  }

  const stockLevels = products.map((p) => p.stock_quantity || 0);
  if (Math.max(...stockLevels) - Math.min(...stockLevels) > 50) {
    differences.push(
      "Stock availability varies significantly, affecting project timeline planning"
    );
  }

  differences.push(
    "Delivery method options differ between products, impacting accessibility and cost"
  );

  return differences;
}

function generateFallbackRecommendations(products: Product[]): string[] {
  const recommendations = [];

  // Find highest grade product
  const highestGradeProduct = products.reduce((prev, current) => {
    const prevGrade = parseInt(prev.grade.replace("N", ""));
    const currentGrade = parseInt(current.grade.replace("N", ""));
    return currentGrade > prevGrade ? current : prev;
  });

  recommendations.push(
    `For structural applications, choose "${highestGradeProduct.name}" with ${highestGradeProduct.grade} grade for optimal load-bearing capacity`
  );

  // Find most cost-effective
  const cheapestProduct = products.reduce((prev, current) => {
    const prevPrice = parseFloat(prev.normal_price || "999999");
    const currentPrice = parseFloat(current.normal_price || "999999");
    return currentPrice < prevPrice ? current : prev;
  });

  recommendations.push(
    `For budget-conscious projects, "${cheapestProduct.name}" offers the best value at RM${cheapestProduct.normal_price} per cubic meter`
  );

  recommendations.push(
    "Consider pump concrete for high-rise construction to reduce labor costs and improve efficiency"
  );
  recommendations.push(
    "Evaluate stock levels and delivery schedules when making final product selection"
  );

  return recommendations;
}

function generateFallbackUseCases(
  products: Product[]
): Array<{ product: string; useCase: string; reason: string }> {
  return products.map((product) => {
    const grade = parseInt(product.grade.replace("N", ""));
    let useCase = "General construction";
    let reason = `${product.grade} grade concrete provides adequate strength`;

    if (grade >= 25) {
      useCase = "Structural elements (columns, beams, foundations)";
      reason = `${product.grade} grade offers high compressive strength suitable for load-bearing structures`;
    } else if (grade >= 20) {
      useCase = "Residential construction and slabs";
      reason = `${product.grade} grade balances strength and cost for residential applications`;
    } else {
      useCase = "Non-structural applications";
      reason = `${product.grade} grade is economical for driveways, walkways, and non-load bearing elements`;
    }

    return {
      product: product.name,
      useCase,
      reason,
    };
  });
}

function generateFallbackInsights(): AIInsight[] {
  return [
    {
      type: "tip",
      title: "Grade Selection Strategy",
      content:
        "Higher grade concrete (N25+) is essential for structural elements, while N20 grade is sufficient for slabs and general construction. This can save 15-20% on material costs for non-structural elements.",
      icon: "lightbulb",
    },
    {
      type: "analysis",
      title: "Delivery Method Impact",
      content:
        "Pump concrete typically costs 10-15% more but can reduce labor costs by up to 30% and construction time by 25% for multi-story projects.",
      icon: "trending",
    },
    {
      type: "recommendation",
      title: "Stock Planning",
      content:
        "Always verify stock availability before finalizing concrete orders. Consider ordering 5-10% extra to account for wastage and ensure project continuity.",
      icon: "brain",
    },
  ];
}
