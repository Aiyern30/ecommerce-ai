import { supabase } from "@/lib/supabase/browserClient";

export async function getFaqs() {
  const { data, error } = await supabase
    .from("faq")
    .select("id, question, answer, section:faq_sections(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch FAQs:", error);
    return [];
  }
  return data;
}
