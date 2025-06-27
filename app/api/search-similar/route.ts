// pages/api/search-similar.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Missing imageBase64" });
  }

  try {
    // For now just log it and return dummy product
    console.log("Image received (base64):", imageBase64.substring(0, 30));

    // Simulate dummy result (replace with your real embedding logic)
    const dummyProducts = [
      {
        id: 1,
        name: "Dummy Cement Bag",
        price: 12.5,
        unit: "bag",
        image_url: "/dummy.jpg",
      },
    ];

    return res.status(200).json(dummyProducts);
  } catch (error) {
    console.error("Image search error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
