// lib/supabase/getFaqs.ts
import { supabase } from "@/lib/supabase/browserClient";

export async function getFaqs() {
  const { data, error } = await supabase
    .from("faq")
    .select("id, section, question, answer")
    .order("section", { ascending: true });

  if (error) {
    console.error("Failed to fetch FAQs:", error);
    return [];
  }
  return data;
}
