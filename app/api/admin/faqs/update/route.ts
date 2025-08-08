import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, question, answer, status, section } = body;

    if (!id || !question || !answer || !status || !section) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the FAQ exists
    const { data: existingFaq, error: faqError } = await supabaseAdmin
      .from("faq")
      .select("id")
      .eq("id", id)
      .single();

    if (faqError || !existingFaq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    // Find or create section
    let sectionId: string | null = null;

    const { data: existingSection } = await supabaseAdmin
      .from("faq_sections")
      .select("id")
      .eq("name", section)
      .single();

    if (existingSection) {
      sectionId = existingSection.id;
    } else {
      const { data: newSection, error: sectionError } = await supabaseAdmin
        .from("faq_sections")
        .insert({ name: section })
        .select()
        .single();

      if (sectionError || !newSection) {
        return NextResponse.json(
          { error: "Failed to create section" },
          { status: 500 }
        );
      }

      sectionId = newSection.id;
    }

    // Update the FAQ
    const { error: updateError, data: updatedFaq } = await supabaseAdmin
      .from("faq")
      .update({
        question,
        answer,
        status,
        section_id: sectionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (updateError || !updatedFaq || updatedFaq.length === 0) {
      return NextResponse.json(
        { error: "Failed to update FAQ" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, faq: updatedFaq[0] });
  } catch (err) {
    console.error("FAQ update route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
