'use client';
import { useState } from 'react';
import type { DailyTask } from '@/lib/types';

export default function TaskList({ tasks }: { tasks: DailyTask[] }) {
  const [state, setState] = useState(tasks);

  async function toggle(id: string, done: boolean) {
    setState((s) => s.map((t) => (t.id === id ? { ...t, done } : t))); // optimistic
    await fetch('/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: id, done }),
    });
  }

  return (
    <>
      {state.map((t) => (
        <div key={t.id} className={`task ${t.done ? 'done' : ''}`} onClick={() => toggle(t.id, !t.done)}>
          <div className="check">✓</div>
          <div className="t-main">
            <div className="t-title">{t.title}</div>
            {t.detail && <div className="t-detail">{t.detail}</div>}
            <div className="t-meta">
              <span className="impact">↑ {t.impact}</span>
              {t.action && <button className="t-act" onClick={(e) => { e.stopPropagation(); }}>{t.action}</button>}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
