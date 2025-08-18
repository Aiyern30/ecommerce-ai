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

    // Call Google Cloud Vision API
    let result;
    try {
      console.log("📸 Calling Google Vision API...");
      [result] = await vision.labelDetection({
        image: { content: imageBuffer },
      });
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

    const labels = result.labelAnnotations || [];
    const labelTexts = labels.map((l) => l.description || "").filter(Boolean);

    // Match to concrete product
    const matchedProduct = matchConcreteProduct(labelTexts, products);

    // Calculate confidence score
    const confidence =
      labels.length > 0
        ? Math.min(0.95, Math.max(0.3, labels[0].score || 0.5))
        : 0.5;

    return NextResponse.json({
      success: true,
      detectedLabels: labelTexts.slice(0, 10),
      matchedProduct,
      confidence: Math.round(confidence * 100),
      message: matchedProduct
        ? `We recommend ${matchedProduct.name}`
        : "No suitable concrete type detected",
      totalProducts: products.length, // For debugging
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

// Optional: Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to upload images." },
    { status: 405 }
  );
}
