import { createClient } from "@/lib/supabase/server";
import { successPlaybook, type SuccessTask } from "@/lib/success-playbook";
import { countUpcomingDeadlines } from "@/lib/queries";

export interface TodayTask extends SuccessTask {
  done: boolean;
}

export interface TodayBlock {
  key: string;
  title: string;
  timeLabel: string;
  tasks: TodayTask[];
}

export interface TodayPlan {
  blocks: TodayBlock[];
  bannerDetail: string;
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getHotLeadsDetail(): Promise<string> {
  const supabase = createClient();

  const { data, count } = await supabase
    .from("leads")
    .select("name, suburb", { count: "exact" })
    .eq("status", "new")
    .eq("temperature", "hot")
    .order("created_at", { ascending: false })
    .limit(3);

  const total = count ?? 0;

  if (total === 0) {
    return "No hot leads yet — generate some this hour.";
  }

  const names = (data ?? []).map((lead) => {
    const name: string = lead.name?.trim() || "Unnamed lead";
    return lead.suburb ? `${name} (${lead.suburb})` : name;
  });

  return `${total} hot lead${total === 1 ? "" : "s"}: ${names.join(
    ", "
  )}. Call before they call another agent.`;
}

async function getDeadlinesDetail(): Promise<string> {
  const count = await countUpcomingDeadlines();

  if (count === 0) {
    return "No deadlines this week — good.";
  }

  return `${count} suspensive condition${
    count === 1 ? "" : "s"
  } due within 7 days — chase them before deals die.`;
}

export async function getTodayPlan(): Promise<TodayPlan> {
  const supabase = createClient();
  const today = todayDateString();

  const [hotLeadsDetail, deadlinesDetail, doneRowsResult] = await Promise.all([
    getHotLeadsDetail(),
    getDeadlinesDetail(),
    supabase.from("daily_tasks").select("task_key, done").eq("task_date", today),
  ]);

  const dynamicDetails: Record<string, string> = {
    hot_leads: hotLeadsDetail,
    deadlines: deadlinesDetail,
  };

  const doneMap = new Map(
    (doneRowsResult.data ?? []).map((row) => [row.task_key as string, row.done as boolean])
  );

  const blocks: TodayBlock[] = successPlaybook.map((block) => ({
    key: block.key,
    title: block.title,
    timeLabel: block.timeLabel,
    tasks: block.tasks.map((task) => ({
      ...task,
      detail: task.dynamicKey ? dynamicDetails[task.dynamicKey] : task.detail,
      done: doneMap.get(task.id) ?? false,
    })),
  }));

  return { blocks, bannerDetail: hotLeadsDetail };
}

export async function toggleTask(taskKey: string, done: boolean): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("daily_tasks").upsert(
    {
      agent_id: user.id,
      task_date: todayDateString(),
      task_key: taskKey,
      done,
      done_at: done ? new Date().toISOString() : null,
    },
    { onConflict: "agent_id,task_date,task_key" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
