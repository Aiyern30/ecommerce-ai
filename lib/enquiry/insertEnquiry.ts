// lib/supabase/insertEnquiry.ts
import { supabase } from "@/lib/supabase/browserClient";

type EnquiryInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function insertEnquiry({
  name,
  email,
  subject,
  message,
}: EnquiryInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not authenticated");
    return;
  }

  const { data, error } = await supabase
    .from("enquiries")
    .insert([
      {
        user_id: user.id,
        name,
        email,
        subject,
        message,
      },
    ])
    .select();

  if (error) {
    console.error("Insert enquiry failed:", error);
  } else {
    console.log("Enquiry inserted:", data);
  }
}
