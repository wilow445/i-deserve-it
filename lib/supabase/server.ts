import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Single-user mode: hardcoded Rebecca user ID
export const REBECCA_USER_ID = "72e8c04e-dea1-49f5-a3b1-5a8db54523ab";

export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function getUser() {
  return { id: REBECCA_USER_ID, email: "beccareekie@icloud.com" };
}
