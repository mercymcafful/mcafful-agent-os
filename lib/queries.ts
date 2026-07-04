import { supabaseServer } from './supabase/server';

export async function getLeads() {
  const sb = supabaseServer();
  const { data } = await sb.from('leads').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

const STAGES = ['new_lead','valuation','mandate','live','otp','transfer','registered'] as const;
export const STAGE_LABEL: Record<string,string> = {
  new_lead:'New lead', valuation:'Valuation', mandate:'Mandate', live:'Live · marketing',
  otp:'Offer / OTP', transfer:'Transfer', registered:'Registered',
};
export async function getPipeline() {
  const sb = supabaseServer();
  const { data } = await sb.from('deals')
    .select('id,stage,otp_amount,commission,listings(title,suburb,address,price)')
    .neq('stage','lost');
  const byStage: Record<string, any[]> = Object.fromEntries(STAGES.map(s => [s, []]));
  (data ?? []).forEach((d: any) => byStage[d.stage]?.push(d));
  return STAGES.map(s => ({ stage: s, label: STAGE_LABEL[s], deals: byStage[s] }));
}

export async function getListings() {
  const sb = supabaseServer();
  const { data } = await sb.from('listings').select('*').order('listed_at', { ascending: false });
  return data ?? [];
}

export async function getMetrics() {
  const sb = supabaseServer();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);

  const [{ count: mandates }, { count: sole }, deals, { data: profile }] = await Promise.all([
    sb.from('mandates').select('*', { count: 'exact', head: true }).gte('start_date', monthStart),
    sb.from('mandates').select('*', { count: 'exact', head: true }).eq('type','sole').gte('start_date', monthStart),
    sb.from('deals').select('stage,commission,otp_amount'),
    sb.from('profiles').select('gci_goal').single(),
  ]);

  const d = (deals.data ?? []) as any[];
  const otps = d.filter(x => ['otp','transfer','registered'].includes(x.stage)).length;
  const registrations = d.filter(x => x.stage === 'registered').length;
  const gci = d.filter(x => x.stage === 'registered').reduce((s,x)=>s+Number(x.commission||0),0);
  const pipelineValue = d.filter(x => ['otp','transfer'].includes(x.stage)).reduce((s,x)=>s+Number(x.otp_amount||0),0);
  const goal = Number(profile?.gci_goal ?? 460000);

  const funnel = {
    leads: (await sb.from('leads').select('*',{count:'exact',head:true})).count ?? 0,
    valuations: d.filter(x=>['valuation','mandate','live','otp','transfer','registered'].includes(x.stage)).length,
    mandates: mandates ?? 0,
    otps, registered: registrations,
  };

  return { mandates: mandates ?? 0, sole: sole ?? 0, otps, registrations, gci, goal, pipelineValue, funnel };
}
