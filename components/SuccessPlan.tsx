"use client";

import { useMemo, useState } from "react";
import { successPlaybook } from "@/lib/success-playbook";
import { ProgressRing } from "./ProgressRing";
import styles from "./SuccessPlan.module.css";

export function SuccessPlan() {
  const allTaskIds = useMemo(
    () => successPlaybook.flatMap((block) => block.tasks.map((task) => task.id)),
    []
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const completedCount = allTaskIds.filter((id) => checked[id]).length;
  const totalCount = allTaskIds.length;
  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  function toggleTask(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      <div className={styles.banner}>
        <span className={styles.bannerLabel}>Next best action</span>
        <p className={styles.bannerText}>
          Call your 3 hottest leads — start your day here.
        </p>
      </div>

      <div className={styles.progressRow}>
        <ProgressRing percent={percent} />
        <div>
          <p className={styles.progressCount}>
            {completedCount} of {totalCount} done
          </p>
          <p className={styles.progressNote}>
            Prospecting before admin — work the blocks in order.
          </p>
        </div>
      </div>

      <div className={styles.blocks}>
        {successPlaybook.map((block) => (
          <section key={block.key} className={styles.block}>
            <div className={styles.blockHeader}>
              <h2 className={styles.blockTitle}>{block.title}</h2>
              <span className={styles.blockTime}>{block.timeLabel}</span>
            </div>
            <div className={styles.taskList}>
              {block.tasks.map((task) => {
                const isDone = Boolean(checked[task.id]);
                return (
                  <label
                    key={task.id}
                    className={`${styles.task} ${isDone ? styles.taskDone : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleTask(task.id)}
                      className={styles.checkbox}
                    />
                    <div className={styles.taskBody}>
                      <p className={styles.taskTitle}>{task.title}</p>
                      {task.detail && (
                        <p className={styles.taskDetail}>{task.detail}</p>
                      )}
                    </div>
                    <span className={styles.impactPill}>{task.impact}</span>
                    <span className={styles.actionLabel}>{task.action}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
