import { getPublicListings } from "@/lib/queries";
import { ListingCard } from "./ListingCard";
import styles from "./FeaturedListings.module.css";

export async function FeaturedListings() {
  const listings = await getPublicListings(6);

  return (
    <section id="listings" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Featured</p>
          <h2 className={styles.heading}>On the market now</h2>
        </div>

        {listings.length === 0 ? (
          <p className={styles.empty}>New listings coming soon.</p>
        ) : (
          <div className={styles.grid}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
