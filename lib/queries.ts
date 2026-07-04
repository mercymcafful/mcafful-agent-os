import { createClient } from "@/lib/supabase/server";

export interface Lead {
  id: string;
  agent_id: string;
  name: string | null;
  contact: string | null;
  suburb: string | null;
  timeline: string | null;
  source: string;
  temperature: string;
  status: string;
  created_at: string;
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
