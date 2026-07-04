"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/queries";
import { PostListingForm } from "./PostListingForm";
import { CockpitListingCard } from "./CockpitListingCard";
import styles from "./ListingsManager.module.css";

export function ListingsManager({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  function handlePosted() {
    setShowForm(false);
    router.refresh();
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Listings</h1>
          <p className={styles.subtitle}>
            Everything you have on the market, in one place.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => setShowForm((value) => !value)}
        >
          {showForm ? "Cancel" : "Post a listing"}
        </button>
      </div>

      {showForm && <PostListingForm onPosted={handlePosted} />}

      {listings.length === 0 ? (
        <div className={styles.empty}>
          <p>No listings yet — post your first one above.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {listings.map((listing) => (
            <CockpitListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
