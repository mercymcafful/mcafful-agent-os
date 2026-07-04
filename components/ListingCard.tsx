import type { Listing } from "@/lib/listings";
import { formatZAR } from "@/lib/format";
import styles from "./ListingCard.module.css";

export function ListingCard({ listing }: { listing: Listing }) {
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
        <p className={styles.price}>{formatZAR(listing.price)}</p>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.location}>
          {listing.street}, {listing.suburb}
        </p>
        <p className={styles.meta}>
          {listing.beds} bed · {listing.baths} bath · {listing.garages}{" "}
          garage{listing.garages === 1 ? "" : "s"}
        </p>
      </div>
    </article>
  );
}
