import { NextResponse } from "next/server";
import { toggleTask } from "@/lib/success-engine";

interface ToggleTaskBody {
  taskKey?: unknown;
  done?: unknown;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ToggleTaskBody | null;

  const taskKey = typeof body?.taskKey === "string" ? body.taskKey : "";
  const done = typeof body?.done === "boolean" ? body.done : null;

  if (!taskKey || done === null) {
    return NextResponse.json(
      { ok: false, error: "taskKey and done are required." },
      { status: 400 }
    );
  }

  try {
    await toggleTask(taskKey, done);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save task.";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }

  return NextResponse.json({ ok: true });
}
