import { createClient } from '@supabase/supabase-js';

// Service-role client — SERVER ONLY. Bypasses RLS.
// Used by public endpoints (valuation form, WhatsApp webhook) that must write
// leads on Mercy's behalf without an authenticated session.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export const AGENT_ID = process.env.AGENT_ID!;
