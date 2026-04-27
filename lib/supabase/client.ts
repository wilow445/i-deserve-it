import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const REBECCA_USER_ID = "72e8c04e-dea1-49f5-a3b1-5a8db54523ab";

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
