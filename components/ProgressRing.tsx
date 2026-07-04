import styles from "./ProgressRing.module.css";

const SIZE = 88;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ percent }: { percent: number }) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={styles.ring}
      role="img"
      aria-label={`${percent} percent of today's tasks complete`}
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(12, 42, 32, 0.1)"
        strokeWidth={STROKE}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        className={styles.progress}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className={styles.ringText}
      >
        {percent}%
      </text>
    </svg>
  );
}
