export interface Customer {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  status: "active" | "inactive" | "banned";
  role: "customer" | "admin" | "staff";
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  // Ban info from app_metadata
  ban_info?: {
    reason?: string;
    banned_at?: string;
    banned_by?: string;
    banned_by_email?: string;
    banned_by_name?: string;
    banned_until?: string;
    previous_bans?: {
      reason?: string;
      banned_at?: string;
      banned_by?: string;
      banned_by_email?: string;
      banned_by_name?: string;
      banned_until?: string;
    }[];
    unbanned_at?: string;
    unbanned_by?: string;
    unbanned_by_email?: string;
    unbanned_by_name?: string;
  };
}
