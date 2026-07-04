import type { PipelineStage } from "@/lib/queries";
import { formatZAR } from "@/lib/format";
import styles from "./PipelineBoard.module.css";

export function PipelineBoard({ stages }: { stages: PipelineStage[] }) {
  const totalDeals = stages.reduce((sum, stage) => sum + stage.deals.length, 0);

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.heading}>Pipeline</h1>
        <p className={styles.subtitle}>
          Every deal in motion, enquiry to registration.
        </p>
      </header>

      {totalDeals === 0 ? (
        <div className={styles.empty}>
          <p>No deals yet — once a lead becomes a deal, it&rsquo;ll show up here.</p>
        </div>
      ) : (
        <div className={styles.board}>
          {stages.map((stage) => (
            <section key={stage.key} className={styles.column}>
              <div className={styles.columnHeader}>
                <h2 className={styles.columnTitle}>{stage.label}</h2>
                <span className={styles.columnCount}>{stage.deals.length}</span>
              </div>
              <div className={styles.cards}>
                {stage.deals.map((deal) => {
                  const price = deal.otp_amount ?? deal.listing?.price ?? null;
                  const title =
                    deal.listing?.address || deal.listing?.title || "Untitled deal";
                  const suburb = deal.listing?.suburb;
                  return (
                    <article key={deal.id} className={styles.card}>
                      <p className={styles.price}>
                        {price != null ? formatZAR(price) : "Price TBC"}
                      </p>
                      <p className={styles.title}>{title}</p>
                      {suburb && <p className={styles.suburb}>{suburb}</p>}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
