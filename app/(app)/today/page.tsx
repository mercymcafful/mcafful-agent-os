import { getToday } from '@/lib/success-engine';
import { BLOCK_LABEL } from '@/lib/types';
import TaskList from './TaskList';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const plan = await getToday();
  const pct = plan.total ? Math.round((plan.done / plan.total) * 100) : 0;

  return (
    <div className="view">
      {plan.nextBestAction && (
        <div className="nba">
          <div className="tag">Next best action</div>
          <p>{plan.nextBestAction}</p>
        </div>
      )}

      <div className="panel">
        <div className="engine-top">
          <div className="ring" style={{ ['--pct' as any]: pct }}>
            <span>{pct}%</span>
          </div>
          <div>
            <h2>Today&apos;s Success Plan</h2>
            <p>{plan.done} of {plan.total} top-agent actions complete. Do them in order — prospecting before admin. This is how mandates get made.</p>
          </div>
        </div>

        {plan.blocks.map((b) => (
          <section key={b.block} className="block">
            <div className="block-title"><span className="dot" />{BLOCK_LABEL[b.block]}<span className="time">{b.time_label}</span></div>
            <TaskList tasks={b.tasks} />
          </section>
        ))}
      </div>
    </div>
  );
}
