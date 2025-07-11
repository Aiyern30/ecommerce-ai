import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const createSupabaseClient = () => {
  return createClientComponentClient();
};
