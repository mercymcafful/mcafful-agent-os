import type { Listing } from "@/lib/queries";
import { formatZAR } from "@/lib/format";
import styles from "./CockpitListingCard.module.css";

const statusClass: Record<string, string> = {
  active: styles.statusActive,
  under_offer: styles.statusUnderOffer,
  sold: styles.statusSold,
  draft: styles.statusDraft,
};

const statusLabel: Record<string, string> = {
  active: "Active",
  under_offer: "Under offer",
  sold: "Sold",
  draft: "Draft",
};

export function CockpitListingCard({ listing }: { listing: Listing }) {
  const locationLine = [listing.address, listing.suburb]
    .filter(Boolean)
    .join(", ");

  const metaParts = [
    listing.beds ? `${listing.beds} bed` : null,
    listing.baths ? `${listing.baths} bath` : null,
    listing.garages
      ? `${listing.garages} garage${listing.garages === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <p className={styles.price}>
          {listing.price != null ? formatZAR(listing.price) : "Price on request"}
        </p>
        <span
          className={`${styles.statusPill} ${
            statusClass[listing.status] ?? styles.statusDraft
          }`}
        >
          {statusLabel[listing.status] ?? listing.status}
        </span>
      </div>
      <h3 className={styles.title}>{listing.title}</h3>
      {locationLine && <p className={styles.location}>{locationLine}</p>}
      {metaParts.length > 0 && (
        <p className={styles.meta}>{metaParts.join(" · ")}</p>
      )}
      <div className={styles.stats}>
        <span>{listing.views} views</span>
        <span>{listing.enquiries} enquiries</span>
      </div>
    </article>
  );
}
