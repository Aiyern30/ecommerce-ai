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

// Function to estimate concrete quantity from image analysis
function estimateConcreteQuantity(labels: string[], objectAnnotations: any[]) {
  const labelTexts = labels.map((l) => l.toLowerCase());

  // Base estimation logic
  let estimatedVolume = 0;
  let confidenceLevel = "low";
  let reasoning = "";

  // Estimate based on detected construction elements
  if (labelTexts.some((label) => label.includes("foundation"))) {
    estimatedVolume = 25; // Typical small foundation
    confidenceLevel = "medium";
    reasoning =
      "Foundation detected - estimated for typical residential foundation";
  } else if (
    labelTexts.some(
      (label) => label.includes("slab") || label.includes("floor")
    )
  ) {
    estimatedVolume = 15; // Typical slab
    confidenceLevel = "medium";
    reasoning = "Floor slab detected - estimated for standard room size";
  } else if (labelTexts.some((label) => label.includes("driveway"))) {
    estimatedVolume = 8; // Typical driveway
    confidenceLevel = "medium";
    reasoning = "Driveway detected - estimated for single car driveway";
  } else if (labelTexts.some((label) => label.includes("wall"))) {
    estimatedVolume = 12; // Wall section
    confidenceLevel = "medium";
    reasoning = "Wall structure detected - estimated for standard wall section";
  } else if (
    labelTexts.some(
      (label) => label.includes("column") || label.includes("beam")
    )
  ) {
    estimatedVolume = 3; // Structural element
    confidenceLevel = "medium";
    reasoning =
      "Structural element detected - estimated for typical column/beam";
  } else if (
    labelTexts.some(
      (label) =>
        label.includes("concrete") ||
        label.includes("cement") ||
        label.includes("building") ||
        label.includes("construction")
    )
  ) {
    estimatedVolume = 10; // General concrete work
    confidenceLevel = "low";
    reasoning = "General concrete work detected - basic estimation provided";
  } else {
    // Fallback estimation
    estimatedVolume = 5;
    confidenceLevel = "low";
    reasoning = "General construction project - conservative estimate";
  }

  // Adjust based on image complexity (more objects = potentially larger project)
  if (objectAnnotations.length > 10) {
    estimatedVolume *= 1.5; // Increase for complex scenes
    reasoning += " (adjusted for project complexity)";
  }

  return {
    estimatedVolume: Math.round(estimatedVolume * 10) / 10, // Round to 1 decimal
    confidenceLevel,
    reasoning,
    range: {
      min: Math.round(estimatedVolume * 0.7 * 10) / 10,
      max: Math.round(estimatedVolume * 1.5 * 10) / 10,
    },
  };
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
      .eq("product_type", "concrete")
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

    // Estimate concrete quantity
    const quantityEstimation = estimateConcreteQuantity(
      labelTexts,
      objectAnnotations
    );

    // Match to concrete product
    const matchedProduct = matchConcreteProduct(labelTexts, products);

    // Calculate confidence score
    const confidence =
      labels.length > 0
        ? Math.min(0.95, Math.max(0.3, labels[0].score || 0.5))
        : 0.5;

    // Calculate total cost estimation
    let costEstimation = null;
    if (matchedProduct && quantityEstimation.estimatedVolume > 0) {
      const normalPrice = parseFloat(matchedProduct.normal_price) || 0;
      const pumpPrice = matchedProduct.pump_price
        ? parseFloat(matchedProduct.pump_price)
        : null;

      costEstimation = {
        normal: {
          total: Math.round(normalPrice * quantityEstimation.estimatedVolume),
          range: {
            min: Math.round(normalPrice * quantityEstimation.range.min),
            max: Math.round(normalPrice * quantityEstimation.range.max),
          },
        },
        pump: pumpPrice
          ? {
              total: Math.round(pumpPrice * quantityEstimation.estimatedVolume),
              range: {
                min: Math.round(pumpPrice * quantityEstimation.range.min),
                max: Math.round(pumpPrice * quantityEstimation.range.max),
              },
            }
          : null,
      };
    }

    return NextResponse.json({
      success: true,
      detectedLabels: labelTexts.slice(0, 10),
      matchedProduct,
      confidence: Math.round(confidence * 100),
      message: matchedProduct
        ? `We recommend ${matchedProduct.name}`
        : "No suitable concrete type detected",
      totalProducts: products.length,
      quantityEstimation,
      costEstimation,
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
