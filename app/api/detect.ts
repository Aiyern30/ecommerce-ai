import { NextApiRequest, NextApiResponse } from "next";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Google Cloud Vision client
const vision = new ImageAnnotatorClient({
  keyFilename: path.join(process.cwd(), "service-account.json"),
});

// Product data
const CONCRETE_PRODUCTS = [
  {
    idx: 0,
    id: "13f81f76-2797-43d1-8fd7-e358a5039955",
    name: "Concrete N25",
    description:
      "Commonly used for structural elements in residential and commercial buildings, including columns and beams.",
    grade: "N25",
    product_type: "concrete",
    category: "building_materials",
    normal_price: "284.00",
    pump_price: "290.00",
    unit: "per m³",
    stock_quantity: 105,
    status: "published",
    is_featured: true,
  },
  {
    idx: 1,
    id: "23eb3873-c189-4bd4-ba38-0a96a3181381",
    name: "Concrete N20",
    description:
      "A versatile mix for residential driveways, foundations, and floors.",
    grade: "N20",
    product_type: "concrete",
    category: "building_materials",
    normal_price: "275.00",
    pump_price: "281.00",
    unit: "per m³",
    stock_quantity: 250,
    status: "published",
    is_featured: true,
  },
  {
    idx: 2,
    id: "5acc3df3-bcb8-45f2-965f-a14dff33f55a",
    name: "Concrete N15",
    description:
      "Suitable for light-duty residential slabs, footpaths, and kerbs.",
    grade: "N15",
    product_type: "concrete",
    category: "building_materials",
    normal_price: "270.00",
    unit: "per m³",
    stock_quantity: 70,
    status: "published",
    is_featured: true,
  },
];

// Keywords mapping for concrete grades
const CONCRETE_KEYWORDS = {
  N25: [
    "building",
    "structure",
    "structural",
    "column",
    "beam",
    "commercial",
    "high-rise",
    "reinforcement",
    "rebar",
    "construction",
    "framework",
    "support",
    "load-bearing",
    "concrete mixer",
    "heavy duty",
  ],
  N20: [
    "driveway",
    "foundation",
    "floor",
    "residential",
    "slab",
    "basement",
    "garage",
    "patio",
    "sidewalk",
    "pavement",
    "pathway",
    "concrete truck",
    "pouring",
    "flatwork",
    "home construction",
  ],
  N15: [
    "footpath",
    "kerb",
    "curb",
    "light",
    "walkway",
    "garden",
    "decorative",
    "small project",
    "pathway",
    "edging",
    "border",
    "landscaping",
    "minor construction",
    "patch",
    "repair",
  ],
};

function matchConcreteProduct(labels: string[]) {
  const labelTexts = labels.map((l) => l.toLowerCase());
  let bestMatch = { grade: "", score: 0 };

  Object.entries(CONCRETE_KEYWORDS).forEach(([grade, keywords]) => {
    let score = 0;
    keywords.forEach((keyword) => {
      if (labelTexts.some((label) => label.includes(keyword.toLowerCase()))) {
        score += 1;
      }
    });
    if (score > bestMatch.score) bestMatch = { grade, score };
  });

  if (bestMatch.score === 0) {
    return CONCRETE_PRODUCTS.find((p) => p.grade === "N20");
  }
  return CONCRETE_PRODUCTS.find((p) => p.grade === bestMatch.grade) || null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024,
      filter: (part) =>
        typeof part.mimetype === "string" && part.mimetype.includes("image"),
    });

    const { files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const uploadedFile =
      files.image && Array.isArray(files.image) ? files.image[0] : files.image;

    if (
      !uploadedFile ||
      typeof uploadedFile !== "object" ||
      !("filepath" in uploadedFile)
    ) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const file = uploadedFile as formidable.File;
    const imageBuffer = fs.readFileSync(file.filepath);

    const [result] = await vision.labelDetection({
      image: { content: imageBuffer },
    });
    const labels = result.labelAnnotations || [];
    const labelTexts = labels.map((l) => l.description || "").filter(Boolean);

    try {
      fs.unlinkSync(file.filepath);
    } catch {}

    const matchedProduct = matchConcreteProduct(labelTexts);
    const confidence =
      labels.length > 0
        ? Math.min(0.95, Math.max(0.3, labels[0].score || 0.5))
        : 0.5;

    return res.status(200).json({
      success: true,
      detectedLabels: labelTexts.slice(0, 10),
      matchedProduct,
      confidence: Math.round(confidence * 100),
      message: matchedProduct
        ? `We recommend ${matchedProduct.name}`
        : "No suitable concrete type detected",
    });
  } catch (err) {
    console.error("Vision API Error:", err);
    return res.status(500).json({ error: "Image processing failed" });
  }
}
