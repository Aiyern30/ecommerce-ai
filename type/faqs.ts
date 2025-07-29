export type Faq = {
  id: string;
  question: string;
  answer: string;
  section_id: string | null;
  section?: {
    name: string;
  } | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};
