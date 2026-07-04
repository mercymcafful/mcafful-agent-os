import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { taskId, done } = await req.json();
  const sb = supabaseServer();
  const { error } = await sb.from('daily_tasks')
    .update({ done, done_at: done ? new Date().toISOString() : null })
    .eq('id', taskId); // RLS ensures it's Mercy's own task
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
