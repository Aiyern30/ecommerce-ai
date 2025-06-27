export async function getImageEmbedding(imageBase64: string) {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: imageBase64 }),
    }
  );

  const result = await res.json();

  if (result.error) {
    console.error("Hugging Face API Error:", result);
    throw new Error("Hugging Face error: " + result.error);
  }

  if (!Array.isArray(result)) {
    console.error("Invalid embedding response (not array):", result);
    throw new Error("Invalid embedding");
  }

  return result[0];
}
