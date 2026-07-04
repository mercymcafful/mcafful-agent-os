import "server-only";
import { createClient } from "@supabase/supabase-js";

// Uses the service role key, which bypasses RLS. Never import this into a
// client component or otherwise expose it to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);
