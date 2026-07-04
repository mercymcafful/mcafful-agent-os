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

export interface Listing {
  id: string;
  agent_id: string;
  title: string;
  suburb: string | null;
  address: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  garages: number | null;
  status: string;
  description: string | null;
  views: number;
  enquiries: number;
  listed_at: string;
}

// All of the signed-in agent's listings, for the cockpit.
export async function getListings(): Promise<Listing[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("listed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

// Active listings only, for the public homepage. Works signed-out — the
// "listings_public_read_active" RLS policy allows this regardless of auth.
export async function getPublicListings(limit = 6): Promise<Listing[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("listed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export interface Deal {
  id: string;
  agent_id: string;
  listing_id: string | null;
  stage: string;
  otp_amount: number | null;
  commission: number | null;
  created_at: string;
  listing: {
    title: string;
    suburb: string | null;
    address: string | null;
    price: number | null;
  } | null;
}

export interface PipelineStage {
  key: string;
  label: string;
  deals: Deal[];
}

const PIPELINE_STAGES: { key: string; label: string }[] = [
  { key: "new_lead", label: "New lead" },
  { key: "valuation", label: "Valuation" },
  { key: "mandate", label: "Mandate" },
  { key: "live", label: "Live · marketing" },
  { key: "otp", label: "Offer / OTP" },
  { key: "transfer", label: "Transfer" },
  { key: "registered", label: "Registered" },
];

// The agent's deals (excluding 'lost'), grouped into the seven pipeline
// stages in order, each joined with its listing's basics.
export async function getPipeline(): Promise<PipelineStage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pipeline_deals")
    .select(
      "id, agent_id, listing_id, stage, otp_amount, commission, created_at, listing:listings(title, suburb, address, price)"
    )
    .neq("stage", "lost")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const deals = (data ?? []) as unknown as Deal[];

  return PIPELINE_STAGES.map((stage) => ({
    key: stage.key,
    label: stage.label,
    deals: deals.filter((deal) => deal.stage === stage.key),
  }));
}

// Number of unmet suspensive conditions due in the next 7 days, for the
// Success Plan's "deadlines" task.
export async function countUpcomingDeadlines(): Promise<number> {
  const supabase = createClient();

  const today = new Date();
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const todayStr = today.toISOString().slice(0, 10);
  const in7DaysStr = in7Days.toISOString().slice(0, 10);

  const { count, error } = await supabase
    .from("deal_conditions")
    .select("id", { count: "exact", head: true })
    .eq("met", false)
    .gte("due_date", todayStr)
    .lte("due_date", in7DaysStr);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
