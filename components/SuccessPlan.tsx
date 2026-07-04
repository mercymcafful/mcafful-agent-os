"use client";

import { useMemo, useState } from "react";
import type { TodayPlan } from "@/lib/success-engine";
import { ProgressRing } from "./ProgressRing";
import styles from "./SuccessPlan.module.css";

export function SuccessPlan({ initialPlan }: { initialPlan: TodayPlan }) {
  const [blocks, setBlocks] = useState(initialPlan.blocks);

  const allTasks = useMemo(
    () => blocks.flatMap((block) => block.tasks),
    [blocks]
  );
  const completedCount = allTasks.filter((task) => task.done).length;
  const totalCount = allTasks.length;
  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  function setTaskDone(taskKey: string, done: boolean) {
    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        tasks: block.tasks.map((task) =>
          task.id === taskKey ? { ...task, done } : task
        ),
      }))
    );
  }

  async function toggleTask(taskKey: string, nextDone: boolean) {
    setTaskDone(taskKey, nextDone); // optimistic

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskKey, done: nextDone }),
      });
      if (!response.ok) throw new Error("Failed to save");
    } catch {
      setTaskDone(taskKey, !nextDone); // revert on failure
    }
  }

  return (
    <div>
      <div className={styles.banner}>
        <span className={styles.bannerLabel}>Next best action</span>
        <p className={styles.bannerText}>{initialPlan.bannerDetail}</p>
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
        {blocks.map((block) => (
          <section key={block.key} className={styles.block}>
            <div className={styles.blockHeader}>
              <h2 className={styles.blockTitle}>{block.title}</h2>
              <span className={styles.blockTime}>{block.timeLabel}</span>
            </div>
            <div className={styles.taskList}>
              {block.tasks.map((task) => (
                <label
                  key={task.id}
                  className={`${styles.task} ${
                    task.done ? styles.taskDone : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id, !task.done)}
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
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
