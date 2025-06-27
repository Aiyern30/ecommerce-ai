// app/api/search-similar/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageBase64 } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
  }

  try {
    // Example response
    const dummyProducts = [
      {
        id: 1,
        name: "Sample Product",
        price: 12.34,
        unit: "bag",
        image_url: "/sample.png",
      },
    ];

    return NextResponse.json(dummyProducts);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
