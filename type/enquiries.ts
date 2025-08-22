export interface Enquiry {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string | null;
  updated_at: string | null;
  status: "all" | "open" | "pending" | "closed";
  staff_reply: string | null;
}
