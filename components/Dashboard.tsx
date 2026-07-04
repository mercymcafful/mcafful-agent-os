import type { Metrics } from "@/lib/queries";
import { formatZAR } from "@/lib/format";
import styles from "./Dashboard.module.css";

export function Dashboard({ metrics }: { metrics: Metrics }) {
  const goalPercent =
    metrics.goal > 0
      ? Math.min(100, Math.round((metrics.gci / metrics.goal) * 100))
      : 0;

  const funnelSteps = [
    { label: "Leads", value: metrics.funnel.leads },
    { label: "Valuations", value: metrics.funnel.valuations },
    { label: "Mandates", value: metrics.funnel.mandates },
    { label: "OTPs", value: metrics.funnel.otps },
    { label: "Registered", value: metrics.funnel.registered },
  ];
  const maxFunnelValue = Math.max(1, ...funnelSteps.map((step) => step.value));

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.heading}>Dashboard</h1>
        <p className={styles.subtitle}>Your month at a glance.</p>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>GCI this month</p>
          <p className={styles.metricValue}>{formatZAR(metrics.gci)}</p>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className={styles.metricSub}>
            {goalPercent}% to {formatZAR(metrics.goal)} goal
          </p>
        </div>

        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Mandates</p>
          <p className={styles.metricValue}>{metrics.mandatesThisMonth}</p>
          <p className={styles.metricSub}>This month</p>
        </div>

        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>OTPs accepted</p>
          <p className={styles.metricValue}>{metrics.otpsAccepted}</p>
        </div>

        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Registrations</p>
          <p className={styles.metricValue}>{metrics.registrations}</p>
          <p className={styles.metricSub}>
            {formatZAR(metrics.pipelineValue)} in transfer
          </p>
        </div>
      </div>

      <section className={styles.funnelPanel}>
        <h2 className={styles.funnelTitle}>Conversion funnel</h2>
        <div className={styles.funnelBars}>
          {funnelSteps.map((step) => (
            <div key={step.label} className={styles.funnelRow}>
              <span className={styles.funnelLabel}>{step.label}</span>
              <div className={styles.funnelTrack}>
                <div
                  className={styles.funnelFill}
                  style={{ width: `${(step.value / maxFunnelValue) * 100}%` }}
                />
              </div>
              <span className={styles.funnelValue}>{step.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
