import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, answer, section, status } = body;

    if (!question || !answer || !section || !status) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    let sectionId: string | null = null;

    // 1. Check if section exists (case-insensitive)
    const { data: existingSection, error: fetchError } = await supabaseAdmin
      .from("faq_sections")
      .select("id")
      .ilike("name", section)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to check section: " + fetchError.message },
        { status: 500 }
      );
    }

    if (existingSection) {
      sectionId = existingSection.id;
    } else {
      // 2. Create new section
      const { data: newSection, error: insertSectionError } =
        await supabaseAdmin
          .from("faq_sections")
          .insert({ name: section })
          .select()
          .single();

      if (insertSectionError || !newSection) {
        return NextResponse.json(
          { error: "Failed to create section: " + insertSectionError?.message },
          { status: 500 }
        );
      }

      sectionId = newSection.id;
    }

    // 3. Insert FAQ
    const { error: faqError } = await supabaseAdmin.from("faq").insert({
      question,
      answer,
      section_id: sectionId,
      status,
    });

    if (faqError) {
      return NextResponse.json(
        { error: "Failed to create FAQ: " + faqError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "FAQ created successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
