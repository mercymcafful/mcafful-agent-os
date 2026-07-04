export type LeadSource =
  | 'website_valuation' | 'whatsapp' | 'google_call' | 'google_profile'
  | 'property24' | 'private_property' | 'referral' | 'other';
export type LeadType = 'seller' | 'buyer' | 'unknown';
export type Temperature = 'hot' | 'warm' | 'cold';
export type LeadStatus = 'new' | 'contacted' | 'appraisal_booked' | 'mandate' | 'nurture' | 'lost';
export type TaskBlock = 'power_hour' | 'sellers' | 'buyers' | 'deals' | 'growth';

export interface Lead {
  id: string; name: string | null; phone: string | null; email: string | null;
  suburb: string | null; source: LeadSource; lead_type: LeadType;
  timeline: string | null; temperature: Temperature; status: LeadStatus;
  summary: string | null; created_at: string;
}

export interface DailyTask {
  id: string; block: TaskBlock; sort: number; time_label: string | null;
  title: string; detail: string | null; impact: string; action: string | null;
  done: boolean;
}

export const BLOCK_LABEL: Record<TaskBlock, string> = {
  power_hour: 'Power Hour · Prospecting',
  sellers: 'Sellers & Mandates',
  buyers: 'Buyers & Viewings',
  deals: 'Deals & Pipeline',
  growth: 'Brand & Growth',
};
