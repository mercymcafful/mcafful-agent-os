import { supabaseAdmin, AGENT_ID } from './supabase/admin';
import { supabaseServer } from './supabase/server';
import type { DailyTask, TaskBlock } from './types';

// Resolves the live "detail" line for dynamic templates from real CRM data.
async function resolveDynamic(db: ReturnType<typeof supabaseAdmin>, key: string): Promise<string | null> {
  const today = new Date().toISOString().slice(0, 10);
  switch (key) {
    case 'hot_leads': {
      const { data } = await db.from('leads').select('name,suburb')
        .eq('agent_id', AGENT_ID).eq('status', 'new').eq('temperature', 'hot')
        .order('created_at', { ascending: false }).limit(3);
      if (!data?.length) return 'No hot leads waiting — spend the hour generating some.';
      return `${data.length} hot lead(s): ` + data.map((l) => `${l.name ?? 'Unknown'}${l.suburb ? ' (' + l.suburb + ')' : ''}`).join(', ') + '. Call before they call another agent.';
    }
    case 'mandate_feedback': {
      const { count } = await db.from('mandates').select('*', { count: 'exact', head: true })
        .eq('agent_id', AGENT_ID).eq('active', true);
      return `${count ?? 0} active mandate(s) waiting on feedback — drafted, one tap to send.`;
    }
    case 'new_listings': {
      const { count } = await db.from('listings').select('*', { count: 'exact', head: true })
        .eq('agent_id', AGENT_ID).eq('status', 'active').gte('listed_at', today);
      return `${count ?? 0} new listing(s) today to match against your buyer database.`;
    }
    case 'viewings_today':
      return 'Reconfirm every viewing booked for today so no one no-shows.';
    case 'deadlines': {
      const in7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
      const { count } = await db.from('deal_conditions').select('*', { count: 'exact', head: true })
        .eq('met', false).lte('due_date', in7);
      return `${count ?? 0} suspensive condition(s) due within 7 days — chase them before deals die.`;
    }
    default:
      return null;
  }
}

// Idempotently build today's step-by-step success plan from the templates + live data.
export async function generateDailyTasks(date = new Date().toISOString().slice(0, 10)) {
  const db = supabaseAdmin();
  const { data: existing } = await db.from('daily_tasks').select('id')
    .eq('agent_id', AGENT_ID).eq('task_date', date).limit(1);
  if (existing?.length) return; // already generated for today

  const { data: templates } = await db.from('success_activity_templates')
    .select('*').eq('active', true).order('block').order('sort');
  if (!templates) return;

  const rows = [];
  for (const t of templates) {
    const detail = t.is_dynamic ? (await resolveDynamic(db, t.dynamic_key)) ?? t.detail : t.detail;
    rows.push({
      agent_id: AGENT_ID, template_id: t.id, task_date: date,
      block: t.block, sort: t.sort, time_label: t.time_label,
      title: t.title, detail, impact: t.impact, action: t.action, done: false,
    });
  }
  await db.from('daily_tasks').insert(rows);
}

export interface TodayPlan {
  blocks: { block: TaskBlock; time_label: string | null; tasks: DailyTask[] }[];
  total: number;
  done: number;
  nextBestAction: string | null;
}

// RLS-scoped read for the authenticated cockpit.
export async function getToday(date = new Date().toISOString().slice(0, 10)): Promise<TodayPlan> {
  await generateDailyTasks(date);
  const sb = supabaseServer();
  const { data } = await sb.from('daily_tasks').select('*')
    .eq('task_date', date).order('block').order('sort');
  const tasks = (data ?? []) as DailyTask[];

  const order: TaskBlock[] = ['power_hour', 'sellers', 'buyers', 'deals', 'growth'];
  const blocks = order
    .map((block) => {
      const t = tasks.filter((x) => x.block === block);
      return { block, time_label: t[0]?.time_label ?? null, tasks: t };
    })
    .filter((b) => b.tasks.length);

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const hot = tasks.find((t) => t.detail?.startsWith('1 hot') || t.detail?.match(/^\d+ hot lead/));
  const nextBestAction = hot?.detail ?? tasks.find((t) => !t.done)?.detail ?? null;

  return { blocks, total, done, nextBestAction };
}
