// /lib/embedImage.ts
export async function getImageEmbedding(imageBase64: string) {
  const res = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/openai/clip-vit-base-patch32",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: imageBase64 }),
    }
  );

  const vector = await res.json();
  return vector[0]; // 512 or 768 dimension vector
}
