/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/detect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Initialize Google Cloud Vision client (lazy)
let vision: ImageAnnotatorClient | null = null;

function initializeVisionClient() {
  // Check for credentials before initializing
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("🔧 Using GOOGLE_APPLICATION_CREDENTIALS file path");
    return new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    console.log("🔧 Using GOOGLE_APPLICATION_CREDENTIALS_JSON");
    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
    return new ImageAnnotatorClient({
      credentials,
      projectId: credentials.project_id,
    });
  }
  const serviceAccountPath = path.join(process.cwd(), "service-account.json");
  return new ImageAnnotatorClient({
    keyFilename: serviceAccountPath,
  });
}

// Enhanced function to estimate concrete quantity with better algorithms
function estimateConcreteQuantity(labels: string[], objectAnnotations: any[]) {
  const labelTexts = labels.map((l) => l.toLowerCase());

  let estimatedVolume = 0;
  let confidenceLevel: "low" | "medium" | "high" = "low";
  let reasoning = "";
  let projectType = "general";
  let additionalRecommendations: string[] = [];

  // Enhanced detection patterns
  const patterns = {
    foundation: {
      keywords: ["foundation", "footing", "basement", "ground", "excavation"],
      baseVolume: 35,
      multiplier: 1.2,
      confidence: "high" as const,
      recommendations: [
        "Consider waterproofing additives",
        "Allow for extra material due to excavation variations",
      ],
    },
    slab: {
      keywords: ["slab", "floor", "concrete floor", "ground floor", "patio"],
      baseVolume: 20,
      multiplier: 1.0,
      confidence: "high" as const,
      recommendations: [
        "Consider fiber reinforcement",
        "Plan for proper curing time",
      ],
    },
    driveway: {
      keywords: ["driveway", "parking", "carport", "vehicle access"],
      baseVolume: 12,
      multiplier: 1.1,
      confidence: "medium" as const,
      recommendations: [
        "Use higher strength grade for vehicle loads",
        "Consider drainage requirements",
      ],
    },
    wall: {
      keywords: ["wall", "retaining wall", "barrier", "boundary"],
      baseVolume: 15,
      multiplier: 1.3,
      confidence: "medium" as const,
      recommendations: [
        "Consider reinforcement requirements",
        "Plan for formwork",
      ],
    },
    column: {
      keywords: ["column", "pillar", "post", "support"],
      baseVolume: 5,
      multiplier: 1.0,
      confidence: "high" as const,
      recommendations: [
        "High strength concrete recommended",
        "Precise placement required",
      ],
    },
    beam: {
      keywords: ["beam", "lintel", "structural beam"],
      baseVolume: 8,
      multiplier: 1.2,
      confidence: "high" as const,
      recommendations: [
        "Structural grade required",
        "Professional engineering review recommended",
      ],
    },
    stairs: {
      keywords: ["stairs", "steps", "staircase"],
      baseVolume: 6,
      multiplier: 1.4,
      confidence: "medium" as const,
      recommendations: [
        "Non-slip surface treatment",
        "Precise formwork essential",
      ],
    },
    pool: {
      keywords: ["pool", "swimming", "water feature"],
      baseVolume: 50,
      multiplier: 1.5,
      confidence: "medium" as const,
      recommendations: [
        "Waterproof concrete required",
        "Special additives needed",
        "Professional installation recommended",
      ],
    },
  };

  // Detect project type and calculate base estimation
  let matchedPattern = null;
  let maxScore = 0;

  for (const [type, pattern] of Object.entries(patterns)) {
    let score = 0;
    pattern.keywords.forEach((keyword) => {
      if (labelTexts.some((label) => label.includes(keyword))) {
        score += 1;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      matchedPattern = { type, ...pattern };
    }
  }

  if (matchedPattern && maxScore > 0) {
    estimatedVolume = matchedPattern.baseVolume;
    confidenceLevel = matchedPattern.confidence;
    projectType = matchedPattern.type;
    reasoning = `${
      matchedPattern.type.charAt(0).toUpperCase() + matchedPattern.type.slice(1)
    } project detected`;
    additionalRecommendations = matchedPattern.recommendations;

    // Apply size adjustments based on image complexity
    if (objectAnnotations.length > 15) {
      estimatedVolume *= 1.8; // Large complex project
      reasoning += " - Large scale project detected";
    } else if (objectAnnotations.length > 8) {
      estimatedVolume *= 1.4; // Medium project
      reasoning += " - Medium scale project";
    } else if (objectAnnotations.length < 4) {
      estimatedVolume *= 0.7; // Small project
      reasoning += " - Small scale project";
    }

    // Apply pattern-specific multiplier
    estimatedVolume *= matchedPattern.multiplier;
  } else {
    // Fallback estimation based on general construction indicators
    const constructionIndicators = [
      "building",
      "construction",
      "concrete",
      "cement",
      "structure",
      "site",
      "work",
      "project",
      "development",
    ];

    const hasConstruction = labelTexts.some((label) =>
      constructionIndicators.some((indicator) => label.includes(indicator))
    );

    if (hasConstruction) {
      estimatedVolume = 15;
      reasoning = "General construction project detected";
      projectType = "general";
    } else {
      estimatedVolume = 8;
      reasoning = "Basic concrete work estimated";
      projectType = "basic";
    }
  }

  // Safety margin and rounding
  const finalVolume = Math.round(estimatedVolume * 10) / 10;
  const safetyMargin = 0.15; // 15% safety margin

  return {
    estimatedVolume: finalVolume,
    safetyVolume: Math.round(finalVolume * (1 + safetyMargin) * 10) / 10,
    confidenceLevel,
    reasoning,
    projectType,
    additionalRecommendations,
    range: {
      min: Math.round(finalVolume * 0.8 * 10) / 10,
      max: Math.round(finalVolume * 1.4 * 10) / 10,
      recommended: Math.round(finalVolume * 1.15 * 10) / 10, // 15% buffer
    },
    breakdown: {
      baseEstimate: Math.round(estimatedVolume * 10) / 10,
      safetyMargin: Math.round(finalVolume * safetyMargin * 10) / 10,
      wastageAllowance: Math.round(finalVolume * 0.05 * 10) / 10, // 5% wastage
    },
  };
}

// Enhanced cost calculation with delivery options and recommendations
function calculateComprehensiveCosts(matchedProduct: any, quantityData: any) {
  if (!matchedProduct || !quantityData) return null;

  const deliveryOptions = [
    {
      key: "normal_price",
      label: "Standard Delivery",
      icon: "🚛",
      description: "Best for accessible sites",
    },
    {
      key: "pump_price",
      label: "Pump Delivery",
      icon: "🏗️",
      description: "High-rise or restricted access",
    },
    {
      key: "tremie_1_price",
      label: "Tremie Method 1",
      icon: "🌊",
      description: "Underwater/specialized placement",
    },
    {
      key: "tremie_2_price",
      label: "Tremie Method 2",
      icon: "🌊",
      description: "Deep foundation work",
    },
    {
      key: "tremie_3_price",
      label: "Tremie Method 3",
      icon: "🌊",
      description: "Marine construction",
    },
  ];

  const costBreakdown: any = {};

  deliveryOptions.forEach((option) => {
    const price = parseFloat(matchedProduct[option.key]);
    if (price && price > 0) {
      costBreakdown[option.key] = {
        ...option,
        pricePerUnit: price,
        costs: {
          estimated: Math.round(price * quantityData.estimatedVolume),
          withSafety: Math.round(price * quantityData.safetyVolume),
          recommended: Math.round(price * quantityData.range.recommended),
          range: {
            min: Math.round(price * quantityData.range.min),
            max: Math.round(price * quantityData.range.max),
          },
        },
      };
    }
  });

  return costBreakdown;
}

// Cache for products to avoid repeated database calls
let cachedProducts: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getProductsFromDatabase() {
  const now = Date.now();

  // Return cached data if it's still fresh
  if (cachedProducts && now - cacheTimestamp < CACHE_DURATION) {
    return cachedProducts;
  }

  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("status", "published");

    if (error) {
      console.error("❌ Error fetching products from database:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!products || products.length === 0) {
      console.warn("⚠️ No concrete products found in database");
      return [];
    }

    // Update cache
    cachedProducts = products;
    cacheTimestamp = now;

    console.log(`✅ Fetched ${products.length} products from database`);
    return products;
  } catch (error) {
    console.error("❌ Failed to fetch products:", error);
    throw error;
  }
}

function matchConcreteProduct(labels: string[], products: any[]) {
  if (!products || products.length === 0) {
    return null;
  }

  const labelTexts = labels.map((l) => l.toLowerCase());
  let bestMatch = { product: null, score: 0 };

  products.forEach((product) => {
    let score = 0;

    // Parse keywords from the product (assuming it's stored as JSON array)
    let keywords: string[] = [];
    if (product.keywords) {
      try {
        keywords = Array.isArray(product.keywords)
          ? product.keywords
          : JSON.parse(product.keywords);
      } catch (e) {
        console.warn(
          `⚠️ Failed to parse keywords for product ${product.name}:`,
          e
        );
        keywords = [];
      }
    }

    // Match against product keywords
    keywords.forEach((keyword: string) => {
      if (labelTexts.some((label) => label.includes(keyword.toLowerCase()))) {
        score += 1;
      }
    });

    // Also match against product name and description
    const productName = product.name?.toLowerCase() || "";
    const productDesc = product.description?.toLowerCase() || "";

    labelTexts.forEach((label) => {
      if (
        productName.includes(label) ||
        label.includes(productName.replace("concrete ", ""))
      ) {
        score += 2; // Higher weight for name matches
      }
      if (productDesc.includes(label)) {
        score += 1;
      }
    });

    if (score > bestMatch.score) {
      bestMatch = { product, score };
    }
  });

  // If no match found, return a default product (e.g., most versatile one like N20)
  if (bestMatch.score === 0) {
    const defaultProduct =
      products.find((p) => p.grade === "N20") || products[0];
    return defaultProduct;
  }

  return bestMatch.product;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Vision client if not already done
    if (!vision) {
      try {
        vision = initializeVisionClient();
      } catch (error) {
        console.error("❌ Failed to initialize Vision client:", error);
        return NextResponse.json(
          {
            error:
              "Google Cloud Vision API initialization failed. Please check your credentials.",
          },
          { status: 500 }
        );
      }
    }

    // Get form data from request
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please upload an image file" },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size should be less than 10MB" },
        { status: 400 }
      );
    }

    // Fetch products from database
    let products;
    try {
      products = await getProductsFromDatabase();
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      return NextResponse.json(
        {
          error: "Failed to fetch product data from database",
          details: process.env.NODE_ENV === "development" ? dbError : undefined,
        },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Call Google Cloud Vision API for both label detection and object localization
    let labelResult, objectResult;
    try {
      console.log("📸 Calling Google Vision API...");

      // Get label annotations
      const [labelResponse] = await vision.labelDetection({
        image: { content: imageBuffer },
      });

      // Only call objectLocalization if it exists
      let objectResponse;
      if (typeof vision.objectLocalization === "function") {
        [objectResponse] = await vision.objectLocalization({
          image: { content: imageBuffer },
        });
      } else {
        objectResponse = { localizedObjectAnnotations: [] };
      }

      labelResult = labelResponse;
      objectResult = objectResponse;

      console.log("✅ Vision API call successful");
    } catch (visionError: any) {
      console.error("❌ Google Cloud Vision API Error:", visionError);
      console.error("Error code:", visionError.code);
      console.error("Error message:", visionError.message);

      // Provide more specific error messages
      if (visionError.code === 7) {
        return NextResponse.json(
          {
            error:
              "Google Cloud Vision API access denied. Please check if the Vision API is enabled and your service account has the correct permissions.",
          },
          { status: 500 }
        );
      } else if (visionError.code === 3) {
        return NextResponse.json(
          { error: "Invalid image format. Please upload a valid image file." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Google Cloud Vision API error: ${visionError.message}` },
        { status: 500 }
      );
    }

    const labels = labelResult.labelAnnotations || [];
    const labelTexts = labels.map((l) => l.description || "").filter(Boolean);
    const objectAnnotations = objectResult.localizedObjectAnnotations || [];

    // Enhanced quantity estimation with better algorithms
    const quantityEstimation = estimateConcreteQuantity(
      labelTexts,
      objectAnnotations
    );

    // Match to concrete product with enhanced scoring
    const matchedProduct = matchConcreteProduct(labelTexts, products);

    // Calculate comprehensive costs with all delivery options
    const comprehensiveCosts = calculateComprehensiveCosts(
      matchedProduct,
      quantityEstimation
    );

    // Enhanced confidence calculation
    const confidence =
      labels.length > 0
        ? Math.min(
            0.95,
            Math.max(
              0.4,
              (labels[0].score || 0.5) * (labels.length > 3 ? 1.2 : 1.0)
            )
          )
        : 0.5;

    // Project insights based on detected elements
    const projectInsights = {
      complexity:
        objectAnnotations.length > 10
          ? "high"
          : objectAnnotations.length > 5
          ? "medium"
          : "low",
      recommendedGrades: getRecommendedGrades(quantityEstimation.projectType),
      timeline: estimateProjectTimeline(
        quantityEstimation.projectType,
        quantityEstimation.estimatedVolume
      ),
      specialConsiderations: getSpecialConsiderations(
        labelTexts,
        quantityEstimation.projectType
      ),
    };

    return NextResponse.json({
      success: true,
      detectedLabels: labelTexts.slice(0, 15), // More labels for better analysis
      matchedProduct,
      confidence: Math.round(confidence * 100),
      message: matchedProduct
        ? `${matchedProduct.name} recommended for ${quantityEstimation.projectType} project`
        : "Analysis complete - see recommendations below",
      totalProducts: products.length,
      quantityEstimation,
      comprehensiveCosts,
      projectInsights,
      analysisMetadata: {
        elementsDetected: objectAnnotations.length,
        labelsFound: labels.length,
        processingTime: new Date().toISOString(),
        aiConfidence: Math.round(confidence * 100),
      },
    });
  } catch (error) {
    console.error("Vision API Error:", error);

    // Return specific error messages
    if (error instanceof Error) {
      if (error.message.includes("INVALID_ARGUMENT")) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }
      if (error.message.includes("PERMISSION_DENIED")) {
        return NextResponse.json(
          { error: "Google Cloud Vision API access denied" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to process image",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper functions for enhanced analysis
function getRecommendedGrades(projectType: string) {
  const gradeRecommendations: { [key: string]: string[] } = {
    foundation: ["N25", "N30", "S30"],
    slab: ["N20", "N25"],
    driveway: ["N20", "N25"],
    wall: ["N20", "N25", "S30"],
    column: ["N25", "S30", "S35"],
    beam: ["S30", "S35"],
    stairs: ["N20", "N25"],
    pool: ["N25", "S30"],
    general: ["N20", "N25"],
  };

  return gradeRecommendations[projectType] || gradeRecommendations.general;
}

function estimateProjectTimeline(projectType: string, volume: number) {
  const baseTimelines: { [key: string]: number } = {
    foundation: 3, // days per 10m³
    slab: 2,
    driveway: 1,
    wall: 2,
    column: 1,
    beam: 2,
    stairs: 3,
    pool: 5,
    general: 2,
  };

  const daysPerTenCubic = baseTimelines[projectType] || 2;
  const estimatedDays = Math.ceil((volume / 10) * daysPerTenCubic);

  return {
    concrete: `${estimatedDays} day${estimatedDays > 1 ? "s" : ""}`,
    curing: "28 days for full strength",
    total: `${estimatedDays + 1}-${
      estimatedDays + 3
    } days including preparation`,
  };
}

function getSpecialConsiderations(labels: string[], projectType: string) {
  const considerations = [];

  if (labels.some((l) => l.includes("water") || l.includes("pool"))) {
    considerations.push("Waterproofing additives recommended");
  }

  if (labels.some((l) => l.includes("outdoor") || l.includes("exterior"))) {
    considerations.push("Weather-resistant concrete grade suggested");
  }

  if (labels.some((l) => l.includes("high") || l.includes("tall"))) {
    considerations.push(
      "High-strength concrete required for structural integrity"
    );
  }

  if (projectType === "foundation") {
    considerations.push("Consider ground conditions and soil testing");
  }

  return considerations.length > 0
    ? considerations
    : ["Standard concrete application"];
}
