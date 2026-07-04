import { listings } from "@/lib/listings";
import { ListingCard } from "./ListingCard";
import styles from "./FeaturedListings.module.css";

export function FeaturedListings() {
  return (
    <section id="listings" className={styles.section}>
      <div className={`container`}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Featured</p>
          <h2 className={styles.heading}>On the market now</h2>
        </div>
        <div className={styles.grid}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
