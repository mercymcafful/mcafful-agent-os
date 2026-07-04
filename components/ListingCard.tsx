import type { Listing } from "@/lib/queries";
import { formatZAR } from "@/lib/format";
import styles from "./ListingCard.module.css";

export function ListingCard({ listing }: { listing: Listing }) {
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
      <div className={styles.image} aria-hidden="true">
        <svg
          viewBox="0 0 64 64"
          className={styles.houseIcon}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 30 L32 10 L56 30" />
          <path d="M14 26 V56 H50 V26" />
          <path d="M27 56 V40 H37 V56" />
        </svg>
      </div>
      <div className={styles.body}>
        <p className={styles.price}>
          {listing.price != null ? formatZAR(listing.price) : "Price on request"}
        </p>
        <h3 className={styles.title}>{listing.title}</h3>
        {locationLine && <p className={styles.location}>{locationLine}</p>}
        {metaParts.length > 0 && (
          <p className={styles.meta}>{metaParts.join(" · ")}</p>
        )}
      </div>
    </article>
  );
}
