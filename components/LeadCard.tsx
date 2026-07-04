import type { Lead } from "@/lib/queries";
import {
  formatSourceLabel,
  looksLikePhoneNumber,
  toWhatsAppDigits,
} from "@/lib/format";
import styles from "./LeadCard.module.css";

const temperatureClass: Record<string, string> = {
  hot: styles.hot,
  warm: styles.warm,
  cold: styles.cold,
};

export function LeadCard({ lead }: { lead: Lead }) {
  const contact = lead.contact ?? "";
  const isPhone = contact !== "" && looksLikePhoneNumber(contact);
  const digits = isPhone ? toWhatsAppDigits(contact) : null;

  return (
    <article className={styles.card}>
      <div className={styles.main}>
        <div className={styles.topRow}>
          <h3 className={styles.name}>{lead.name || "Unnamed lead"}</h3>
          <span
            className={`${styles.pill} ${
              temperatureClass[lead.temperature] ?? styles.cold
            }`}
          >
            {lead.temperature}
          </span>
        </div>
        <p className={styles.detail}>{contact || "No contact provided"}</p>
        {lead.suburb && <p className={styles.detail}>{lead.suburb}</p>}
        <span className={styles.source}>
          {formatSourceLabel(lead.source)}
        </span>
      </div>

      {isPhone && digits && (
        <div className={styles.actions}>
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.actionLink} ${styles.actionPrimary}`}
          >
            WhatsApp
          </a>
          <a href={`tel:+${digits}`} className={`${styles.actionLink} ${styles.actionSecondary}`}>
            Call
          </a>
        </div>
      )}
    </article>
  );
}
