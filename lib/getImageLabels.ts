/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getImageLabels(base64Image: string): Promise<string[]> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  console.log("Vision API Response:", JSON.stringify(data, null, 2));

  const labels =
    data.responses?.[0]?.labelAnnotations?.map((l: any) => l.description) || [];

  return labels;
}
